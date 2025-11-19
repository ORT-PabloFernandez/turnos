"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toAMD } from "./Date";

const TurnosContext = createContext();

export const useTurnos = () => {
  const context = useContext(TurnosContext);
  if (!context) {
    throw new Error("useTurnos must be used within a TurnosProvider");
  }
  return context;
};

export const TurnosProvider = ({ children }) => {
  const [profesionales, setProfesionales] = useState([]);

  // Horarios disponibles
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);

  // Turnos reservados
  const [turnosReservados, setTurnosReservados] = useState([]);

  // Usuario actual (arreglado)
  const { currentUser } = useAuth();
  
  /*
  // TODO: Descomentar cuando tengamos el user de la sesion
  const obtenerTurnosUsuario = async function fetchTurnos(){
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

  //fetch para traer todos los profesionales
  useEffect(() => {
    async function fetchProfesionales() {
      try {
        const response = await fetch("http://localhost:3000/api/profesionales");
        const data = await response.json();
        console.log(data);
        setProfesionales(data);
      } catch (error) {
        console.log(error);
      }
    }
    fetchProfesionales();
  }, []);

  // Generar horarios disponibles para los próximos 30 días
  useEffect(() => {
    const generarHorarios = () => {
      const horarios = [];
      const hoy = new Date();

      for (let dia = 1; dia <= 30; dia++) {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() + dia);

        // Solo días laborables (lunes a viernes)
        if (fecha.getDay() >= 1 && fecha.getDay() <= 5) {
          const fechaAMD = toAMD(fecha);
          profesionales.forEach((profesional) => {
            // Horarios de mañana: 9:00 - 12:00
            for (let hora = 9; hora < 12; hora++) {
              horarios.push({
                id: `${profesional.id}-${fechaAMD}-${hora}:00`,
                profesionalId: profesional.id,
                fecha: fechaAMD,
                hora: `${hora}:00`,
                disponible: true,
              });
            }

            // Horarios de tarde: 14:00 - 17:00
            for (let hora = 14; hora < 17; hora++) {
              horarios.push({
                id: `${profesional.id}-${fechaAMD}-${hora}:00`,
                profesionalId: profesional.id,
                fecha: fechaAMD,
                hora: `${hora}:00`,
                disponible: true,
              });
            }
          });
        }
      }

      setHorariosDisponibles(horarios);
    };

    if (profesionales.length > 0) {
      generarHorarios();
    }
  }, [profesionales]);

  // Funciones para gestionar turnos
  const reservarTurno = (horarioId, datosUsuario = null) => {
    const horario = horariosDisponibles.find((h) => h.id === horarioId);
    if (!horario || !horario.disponible) return false;

    const nuevoTurno = {
      id: Date.now(),
      horarioId: horarioId,
      profesionalId: horario.profesionalId,
      fecha: horario.fecha,
      hora: horario.hora,
      usuario: datosUsuario || currentUser,
      estado: "confirmado",
      fechaReserva: toAMD(new Date()),
    };

    setTurnosReservados((prev) => [...prev, nuevoTurno]);

    // Marcar horario como no disponible
    setHorariosDisponibles((prev) =>
      prev.map((h) => (h.id === horarioId ? { ...h, disponible: false } : h))
    );

    return true;
  };

  const cancelarTurno = async (turnoId) => {
    const turno = turnosReservados.find((t) => t.id === turnoId);
    if (!turno) {
      return { ok: false, message: "Turno no encontrado en el cliente" };
    }

    // Cuando los turnos vengan del backend,
    // aquí deberá existir un identificador real de BD.
    const backendId = turno._id || turno.backendId;

    if (backendId) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/turnos/${backendId}`,
          {
            method: "DELETE",
          }
        );

        if (response.status === 400 || response.status === 404) {
          const data = await response.json().catch(() => ({}));
          return {
            ok: false,
            message: data.message || "No se pudo cancelar el turno",
          };
        }

        if (!response.ok) {
          return {
            ok: false,
            message: "Error interno al cancelar el turno",
          };
        }
      } catch (error) {
        console.error("Error de red al cancelar turno:", error);
        return {
          ok: false,
          message: "Error de red al cancelar el turno",
        };
      }
    }

    // Comportamiento local (mock) que ya tenía:
    setTurnosReservados((prev) => prev.filter((t) => t.id !== turnoId));

    setHorariosDisponibles((prev) =>
      prev.map((h) =>
        h.id === turno.horarioId ? { ...h, disponible: true } : h
      )
    );

    return { ok: true };
  };

  const obtenerTurnosPorProfesional = (profesionalId) => {
    return turnosReservados.filter((t) => t.profesionalId === profesionalId);
  };

  const obtenerTurnosUsuario = (usuarioId = currentUser.id) => {
    return turnosReservados.filter(t => t.usuario.id === usuarioId);
  };

  const obtenerHorariosDisponiblesPorProfesional = (
    profesionalId,
    fecha = null
  ) => {
    return horariosDisponibles.filter((h) => {
      const coincideProfesional = h.profesionalId === profesionalId;
      const coincideFecha = fecha ? h.fecha === fecha : true;
      return coincideProfesional && coincideFecha && h.disponible;
    });
  };

  const value = {
    profesionales,
    setProfesionales,
    horariosDisponibles,
    turnosReservados,
    currentUser,
    reservarTurno,
    cancelarTurno,
    obtenerTurnosPorProfesional,
    obtenerTurnosUsuario,
    obtenerHorariosDisponiblesPorProfesional,
  };

  return (
    <TurnosContext.Provider value={value}>{children}</TurnosContext.Provider>
  );
};
