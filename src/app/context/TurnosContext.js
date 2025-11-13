'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toAMD } from './Date';

const TurnosContext = createContext();

export const useTurnos = () => {
  const context = useContext(TurnosContext);
  if (!context) {
    throw new Error('useTurnos must be used within a TurnosProvider');
  }
  return context;
};

export const TurnosProvider = ({ children }) => {
  // Datos de profesionales
  // const [profesionales, setProfesionales] = useState([
  //   {
  //     id: 1,
  //     nombre: 'Dr. Juan Pérez',
  //     especialidad: 'Cardiología',
  //     avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
  //     email: 'juan.perez@hospital.com'
  //   },
  //   {
  //     id: 2,
  //     nombre: 'Dra. María González',
  //     especialidad: 'Dermatología',
  //     avatar: 'https://images.unsplash.com/photo-1594824475317-e5b8e3f5c8b5?w=150&h=150&fit=crop&crop=face',
  //     email: 'maria.gonzalez@hospital.com'
  //   },
  //   {
  //     id: 3,
  //     nombre: 'Dr. Carlos Rodriguez',
  //     especialidad: 'Traumatología',
  //     avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
  //     email: 'carlos.rodriguez@hospital.com'
  //   }
  // ]);
  const [profesionales, setProfesionales] = useState([]);

  // Horarios disponibles
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);

  // Turnos reservados
  const [turnosReservados, setTurnosReservados] = useState([]);

  // Usuario actual (simulado)
  const [usuarioActual] = useState({
    id: 1,
    nombre: 'Usuario Demo',
    email: 'usuario@demo.com'
  });

  //fetch para traer todos los profesionales
  useEffect(() => {
    async function fetchProfesionales(){
    try{
      const response = await fetch('http://localhost:3000/api/profesionales');
      const data = await response.json();
      console.log(data)
      setProfesionales(data)
    }catch (error){
      console.log(error)
    }
  }
   fetchProfesionales(); 
  },[])

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
          profesionales.forEach(profesional => {
            // Horarios de mañana: 9:00 - 12:00
            for (let hora = 9; hora < 12; hora++) {
              horarios.push({
                id: `${profesional.id}-${fechaAMD}-${hora}:00`,
                profesionalId: profesional.id,
                fecha: fechaAMD,
                hora: `${hora}:00`,
                disponible: true
              });
            }
            
            // Horarios de tarde: 14:00 - 17:00
            for (let hora = 14; hora < 17; hora++) {
              horarios.push({
                id: `${profesional.id}-${fechaAMD}-${hora}:00`,
                profesionalId: profesional.id,
                fecha: fechaAMD,
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
      usuario: datosUsuario || usuarioActual,
      estado: 'confirmado',
      fechaReserva: toAMD(new Date())
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

  const obtenerTurnosUsuario = (usuarioId = usuarioActual.id) => {
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
    usuarioActual,
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
