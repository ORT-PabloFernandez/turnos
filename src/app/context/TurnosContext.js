'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const TurnosContext = createContext();

export const useTurnos = () => {
  const context = useContext(TurnosContext);
  if (!context) {
    throw new Error('useTurnos must be used within a TurnosProvider');
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
          profesionales.forEach(profesional => {
            // Horarios de mañana: 9:00 - 12:00
            for (let hora = 9; hora < 12; hora++) {
              horarios.push({
                id: `${profesional.id}-${fecha.toISOString().split('T')[0]}-${hora}:00`,
                profesionalId: profesional.id,
                fecha: fecha.toISOString().split('T')[0],
                hora: `${hora}:00`,
                disponible: true
              });
            }
            
            // Horarios de tarde: 14:00 - 17:00
            for (let hora = 14; hora < 17; hora++) {
              horarios.push({
                id: `${profesional.id}-${fecha.toISOString().split('T')[0]}-${hora}:00`,
                profesionalId: profesional.id,
                fecha: fecha.toISOString().split('T')[0],
                hora: `${hora}:00`,
                disponible: true
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
    const horario = horariosDisponibles.find(h => h.id === horarioId);
    if (!horario || !horario.disponible) return false;

    const nuevoTurno = {
      id: Date.now(),
      horarioId: horarioId,
      profesionalId: horario.profesionalId,
      fecha: horario.fecha,
      hora: horario.hora,
      usuario: datosUsuario || currentUser,
      estado: 'confirmado',
      fechaReserva: new Date().toISOString()
    };

    setTurnosReservados(prev => [...prev, nuevoTurno]);
    
    // Marcar horario como no disponible
    setHorariosDisponibles(prev => 
      prev.map(h => 
        h.id === horarioId ? { ...h, disponible: false } : h
      )
    );

    return true;
  };

  const cancelarTurno = (turnoId) => {
    const turno = turnosReservados.find(t => t.id === turnoId);
    if (!turno) return false;

    // Eliminar turno
    setTurnosReservados(prev => prev.filter(t => t.id !== turnoId));
    
    // Liberar horario
    setHorariosDisponibles(prev => 
      prev.map(h => 
        h.id === turno.horarioId ? { ...h, disponible: true } : h
      )
    );

    return true;
  };

  const obtenerTurnosPorProfesional = (profesionalId) => {
    return turnosReservados.filter(t => t.profesionalId === profesionalId);
  };

  const obtenerTurnosUsuario = (usuarioId = currentUser.id) => {
    return turnosReservados.filter(t => t.usuario.id === usuarioId);
  };

  const obtenerHorariosDisponiblesPorProfesional = (profesionalId, fecha = null) => {
    return horariosDisponibles.filter(h => {
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
    obtenerHorariosDisponiblesPorProfesional
  };

  return (
    <TurnosContext.Provider value={value}>
      {children}
    </TurnosContext.Provider>
  );
};
