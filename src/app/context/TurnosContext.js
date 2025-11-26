"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
//import { toAMD } from "./Date";

const TurnosContext = createContext(null);

export const useTurnos = () => {
  const context = useContext(TurnosContext);
  if (!context) {
    throw new Error("useTurnos must be used within a TurnosProvider");
  }
  return context;
};

// Saca un id de usuario "usable" desde currentUser
const getUserIdFromCurrentUser = (user) => {
  if (!user) return null;

  if (user.id) return user.id;                         // por si en algún momento tiene id
  if (user._id?.$oid) return user._id.$oid;           // formato típico de Mongo en JSON
  if (typeof user._id === "string") return user._id;  // por si ya viene como string

  return null;
};

export const TurnosProvider = ({ children }) => {
  const [profesionales, setProfesionales] = useState([]);

  // Horarios disponibles
  const [horarios, setHorarios] = useState([]);

  // Turnos reservados
  const [turnosReservados, setTurnosReservados] = useState([]);

  // Usuario actual (arreglado)
  const { currentUser, token } = useAuth();

  console.log("TOKEN ENVIADO:", token);

  //fetch para traer todos los profesionales
  const cargarProfesionales = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/profesionales");
      const data = await response.json();
      console.log("Profesionales:", data);
      setProfesionales(data);
    } catch (error) {
      console.log("Error cargando profesionales:", error);
    }
  };

  // Cargar horarios desde el backend
  const cargarHorarios = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/horarios");
      const data = await response.json();
      console.log("Horarios:", data);
      setHorarios(data);
    } catch (error) {
      console.log("Error cargando horarios:", error);
    }
  };

  // Cargar turnos del usuario desde el backend
  const cargarTurnosUsuario = async () => {
    if (!currentUser) {
      setTurnosReservados([]);
      return;
    }
    const userId = getUserIdFromCurrentUser(currentUser);


    try {
      const response = await fetch(
        `http://localhost:3000/api/turnos?usuarioId=${userId}`
      );
      const data = await response.json();
      console.log("Turnos usuario:", data);
      setTurnosReservados(data);
    } catch (error) {
      console.log("Error cargando turnos del usuario:", error);
    }
  };

  // useEffect de carga inicial

  useEffect(() => {
    cargarProfesionales();
    cargarHorarios();
  }, []);

  useEffect(() => {
    cargarTurnosUsuario();
  }, [currentUser]);

  // Funciones de consulta

const obtenerHorariosDisponiblesPorProfesional = (
    profesionalId,
    fecha = null
  ) => {
    return horarios.filter((h) => {
      const coincideProfesional = h.profesionalId === profesionalId;
      const coincideFecha = fecha ? h.fecha === fecha : true;
      return coincideProfesional && coincideFecha && h.disponible === true;
    });
  };

  const obtenerTurnosPorProfesional = (profesionalId) => {
    return turnosReservados.filter((t) => t.profesionalId === profesionalId);
  };

  // TODO: Descomentar cuando tengamos el user de la sesion
  /*const obtenerTurnosUsuario = async function fetchTurnos(){
    try {
      const response = await fetch('http://localhost:3000/api/turnos/usuario/1');
      const data = await response.json();
      console.log(data)
      setTurnosReservados(data)
    } catch (error){
      console.log(error)
    }
  }

  useEffect(() => {
    obtenerTurnosUsuario(); 
  }, [])*/

  const obtenerTurnosUsuario = () => {
    return turnosReservados;
  };

  //Reservar turno
  const reservarTurno = async (horarioId) => {
    try {
      if (!currentUser) {
        console.warn("Debe estar logueado para reservar turno");
        return false;
      }
       const userId = getUserIdFromCurrentUser(currentUser);

    console.log(">>> Enviando al backend:", {
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
    });
      const res = await fetch("http://localhost:3000/api/turnos", {
        method: "POST",
        headers: { "Content-Type": "application/json",
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
      });

      if (!res.ok) {
      let errorData = {};
      try {
        errorData = await res.json();
      } catch (e) {}
      console.error("Error al crear turno:", res.status, errorData);
      return false;
    }

      // Actualizar frontend
      await cargarHorarios();
      await cargarTurnosUsuario();

      return true;
    } catch (error) {
      console.error("Error reservando turno:", error);
      return false;
    }
  };

  // Cancelar turno

  const cancelarTurno = async (turnoId) => {
  try {
    const res = await fetch(`http://localhost:3000/api/turnos/${turnoId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    let data = {};
    try {
      data = await res.json();
    } catch (e) {
    }

    if (!res.ok) {
      console.error("Error al cancelar el turno:", res.status, data);
      return false;
    }

    // Actualizar frontend
    await cargarHorarios();
    await cargarTurnosUsuario();

    return true;
  } catch (err) {
    console.error("Error de red al cancelar turno:", err);
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
  };

  return (
    <TurnosContext.Provider value={value}>{children}</TurnosContext.Provider>
  );
};
