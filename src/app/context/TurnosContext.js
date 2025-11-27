"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";


const TurnosContext = createContext(null);

export const useTurnos = () => {
  const context = useContext(TurnosContext);
  if (!context) {
    throw new Error("useTurnos must be used within a TurnosProvider");
  }
  return context;
};

const getUserIdFromCurrentUser = (user) => {
  if (!user) return null;

  /*if (user.id) return user.id; // por si en algún momento tiene id
  if (user._id?.$oid) return user._id.$oid; // formato típico de Mongo en JSON
  if (typeof user._id === "string") return user._id; // por si ya viene como string*/

  if (user.id) return user.id;
  if (user._id) {
    if (typeof user._id === "string") return user._id;
    if (user._id.$oid) return user._id.$oid;
  }
  if (user.uid) return user.uid;
  return null;
};

export const TurnosProvider = ({ children }) => {


const [profesionales, setProfesionales] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [turnosReservados, setTurnosReservados] = useState([]);
  const { currentUser, token } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [ratings, setRatings] = useState({});
  const [ratedTurnos, setRatedTurnos] = useState([]);
  const [remindedTurnos, setRemindedTurnos] = useState([]);

  const [turnoParaModificar, setTurnoParaModificar] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const [specialties, setSpecialties] = useState([]);


const fetchSpecialties = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/especialidades");
        const data = await res.json();
        setSpecialties(data);
      } catch (err) {
        console.error("Error loading specialties:", err);
      }
    };

  // 1. CARGAR: Leemos del localStorage al montar
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("turnosApp_notifications");
      if (saved) {
        try {
          setNotifications(JSON.parse(saved));
        } catch (error) {
          console.error("Error al cargar notificaciones:", error);
        }
      }
      setIsLoaded(true); // Marcamos que ya terminamos de cargar
    }
  }, []);

  // 2. GUARDAR: Escribimos en localStorage SOLAMENTE si ya cargamos previamente
  // Esto evita sobrescribir las notificaciones con un array vacío al iniciar
  useEffect(() => {
    if (typeof window !== "undefined" && isLoaded) {
      localStorage.setItem(
        "turnosApp_notifications",
        JSON.stringify(notifications)
      );
    }
  }, [notifications, isLoaded]);

  const addNotification = ({ type, title, message }) => {
    const newNotif = {
      id: Date.now(), // ID único basado en tiempo
      read: false,
      date: new Date(),
      type, // 'success', 'error', 'info'
      title,
      message,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // --- FUNCIÓN PARA MARCAR UNA NOTIFICACIÓN INDIVIDUAL ---
  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // --- CARGA DE DATOS ---
  const cargarProfesionales = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/profesionales");
      const data = await response.json();
      setProfesionales(data);
    } catch (error) {}
  };

  const cargarHorarios = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/horarios");
      const data = await response.json();
      setHorarios(data);
    } catch (error) {}
  };

  const cargarTurnosUsuario = async () => {
    if (!currentUser) {
      setTurnosReservados([]);
      return;
    }
    const userId = getUserIdFromCurrentUser(currentUser);
    const isDoctor =
      currentUser.rol === "medico" ||
      currentUser.role === "doctor" ||
      currentUser.rol === "profesional";

    if (!userId) return;

    try {
      const paramKey = isDoctor ? "profesionalId" : "usuarioId";
      const url = `http://localhost:3000/api/turnos?${paramKey}=${userId}`;

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setTurnosReservados([]);
        return;
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setTurnosReservados(data);
      } else {
        setTurnosReservados([]);
      }
    } catch (error) {}
   /*   if (Array.isArray(data)) {
        setTurnosReservados(data);
      } else {
        setTurnosReservados([]);
      }
    } catch (error) {
      console.log("Error cargando turnos del usuario:", error);
    }*/
  };

  useEffect(() => {
    cargarProfesionales();
    cargarHorarios();
    fetchSpecialties();
  }, []);

  useEffect(() => {
    cargarTurnosUsuario();
  }, [currentUser, token]);

  const obtenerHorariosDisponiblesPorProfesional = (
    profesionalId,
    fecha = null
  ) => {
    const filtrados = horarios.filter((h) => {
      const coincideProfesional = h.profesionalId === profesionalId;
      const coincideFecha = fecha ? h.fecha === fecha : true;
      return coincideProfesional && coincideFecha && h.disponible === true;
    });

    return filtrados.sort((a, b) => {
      const [horaA, minA] = a.hora.split(":").map(Number);
      const [horaB, minB] = b.hora.split(":").map(Number);

      if (horaA !== horaB) return horaA - horaB;
      return minA - minB;
    });
  };

   const calificarProfesional = (profesionalId, puntaje, turnoId) => {
    if (ratedTurnos.includes(turnoId)) return;

    setRatings((prev) => {
      const idStr = String(profesionalId);
      const currentRatings = prev[idStr] || [];
      return {
        ...prev,
        [idStr]: [...currentRatings, Number(puntaje)]
      };
    });

    setRatedTurnos((prev) => [...prev, turnoId]);

    addNotification({
        type: 'success',
        title: '¡Opinión Registrada!',
        message: 'Gracias por calificar la atención.'
    });
  };

const obtenerPromedio = (profesionalId) => {
    const idStr = String(profesionalId);
    const notas = ratings[idStr];

    if (!notas || notas.length === 0) return 0;

    const sum = notas.reduce((a, b) => a + b, 0);
    const promedio = sum / notas.length;

    return parseFloat(promedio.toFixed(1));
  };

  const obtenerCantidadVotos = (profesionalId) => {
      const idStr = String(profesionalId);
      return ratings[idStr]?.length || 0;
  };

   const hasRatedTurno = (turnoId) => {
      return ratedTurnos.includes(turnoId);
  };

  const obtenerTurnosPorProfesional = (profesionalId) => {
    return turnosReservados.filter((t) => t.profesionalId === profesionalId);
  };

  const obtenerTurnosUsuario = () => {
    return turnosReservados;
  };

  const reservarTurno = async (horarioId) => {
    try {
      if (!currentUser) {
        addNotification({
          type: "error",
          title: "Error",
          message: "Debes iniciar sesión.",
        });
        return false;
      }

      const userId = getUserIdFromCurrentUser(currentUser);

      const payload = {
        horarioId,
        usuario: {
          id: userId,
          nombre: currentUser.nombre || currentUser.name || "Paciente",
          email: currentUser.email,
        },
      };

      const res = await fetch("http://localhost:3000/api/turnos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          horarioId,
          usuario: {
            id: userId,
            nombre:
              currentUser.nombre ||
              currentUser.name ||
              currentUser.username ||
              "Paciente",
            email: currentUser.email,
          },
        }),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
       /* let errorData = {};
        try {
          errorData = await res.json();
        } catch (e) {}
        console.error("Error al crear turno:", res.status, errorData);
        return false;
      }*/
        let errorMsg = "No se pudo reservar.";
        try {
          const errData = await res.json();
          errorMsg = errData.message || errorMsg;
        } catch (e) {}

        addNotification({ type: "error", title: "Error", message: errorMsg });
        return false;
      }

      const isDoctor =
        currentUser.rol === "medico" ||
        currentUser.role === "doctor" ||
        currentUser.rol === "profesional";

      if (!isDoctor) {
        addNotification({
          type: "success",
          title: "¡Turno Reservado!",
          message: "Tu cita ha sido confirmada con éxito.",
        });
      }

      await cargarHorarios();
      await cargarTurnosUsuario();
      return true;
    } catch (error) {
      addNotification({
        type: "error",
        title: "Error de red",
        message: "Intenta nuevamente.",
      });
      return false;
    }
  };

  const cancelarTurno = async (turnoId) => {
    try {
      const res = await fetch(`http://localhost:3000/api/turnos/${turnoId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      /*let data = {};
      try {
        data = await res.json();
      } catch (e) {}

      if (!res.ok) {
        console.error("Error al cancelar el turno:", res.status, data);
        return false;
      }

      // Actualizar frontend
      await cargarHorarios();
      await cargarTurnosUsuario();

      return true;
    } catch (err) {
      console.error("Error de red al cancelar turno:", err);*/
      if (!res.ok) {
        addNotification({
          type: "error",
          title: "Error",
          message: "No se pudo cancelar el turno.",
        });
        return false;
      }

      addNotification({
        type: "info",
        title: "Turno Cancelado",
        message: "Has cancelado tu turno correctamente.",
      });

      await cargarHorarios();
      await cargarTurnosUsuario();
      return true;
    } catch (err) {
      return false;
    }
  };

  const value = {
    profesionales,
    setProfesionales,
    horarios,
    setHorarios,
    cargarHorarios,
    turnosReservados,
    reservarTurno,
    cancelarTurno,
    obtenerHorariosDisponiblesPorProfesional,
    obtenerTurnosPorProfesional,
    obtenerTurnosUsuario,
    fetchSpecialties,
    specialties,
    notifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    addNotification,
    calificarProfesional,
    obtenerPromedio,
    obtenerCantidadVotos,
    hasRatedTurno,
  };

  return (
    <TurnosContext.Provider value={value}>{children}</TurnosContext.Provider>
  );
};


