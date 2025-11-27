'use client';

import { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaArrowLeft } from 'react-icons/fa';
import { useTurnos } from '../context/TurnosContext';
import { toAMD } from '../context/Date';

export default function CalendarView({ profesional, onDateSelect, onBack }) {
  const { obtenerHorariosDisponiblesPorProfesional } = useTurnos();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Obtener primer día del mes y días en el mes
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Generar días del calendario
  const calendarDays = [];
  
  // Días vacíos al inicio
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateString = toAMD(date);
    const availableSlots = obtenerHorariosDisponiblesPorProfesional(profesional.id, dateString);
    const isPast = date < today;
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    calendarDays.push({
      day,
      date: dateString,
      availableSlots: availableSlots.length,
      isPast,
      isWeekend,
      isAvailable: availableSlots.length > 0 && !isPast && !isWeekend
    });
  }

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleDateClick = (dayInfo) => {
    if (dayInfo.isAvailable) {
      onDateSelect(dayInfo.date);
    }
  };

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <button className="back-button" onClick={onBack}>
          <FaArrowLeft /> Cambiar Profesional
        </button>
        <div className="selected-professional">
          <img 
            src={profesional.avatar} 
            alt={profesional.nombre}
            onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profesional.nombre)}&background=3b82f6&color=fff&size=80`;
              }}
            />
          <div>
            <h3>{profesional.nombre}</h3>
            <p>{profesional.especialidad}</p>
          </div>
        </div>
      </div>

      <div className="calendar-container">
        <div className="calendar-navigation">
          <button onClick={goToPreviousMonth} disabled={month === today.getMonth() && year === today.getFullYear()}>
            <FaChevronLeft />
          </button>
          <h2>{monthNames[month]} {year}</h2>
          <button onClick={goToNextMonth}>
            <FaChevronRight />
          </button>
        </div>

        <div className="calendar-grid">
          {dayNames.map(day => (
            <div key={day} className="day-header">{day}</div>
          ))}
          
          {calendarDays.map((dayInfo, index) => (
            <div 
              key={index}
              className={`calendar-day ${
                !dayInfo ? 'empty' : 
                dayInfo.isPast ? 'past' : 
                dayInfo.isWeekend ? 'weekend' :
                dayInfo.isAvailable ? 'available' : 'unavailable'
              }`}
              onClick={() => dayInfo && handleDateClick(dayInfo)}
            >
              {dayInfo && (
                <>
                  <span className="day-number">{dayInfo.day}</span>
                  {dayInfo.isAvailable && (
                    <span className="slots-count">{dayInfo.availableSlots} turnos</span>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        <div className="calendar-legend">
          <div className="legend-item">
            <div className="legend-color available"></div>
            <span>Disponible</span>
          </div>
          <div className="legend-item">
            <div className="legend-color unavailable"></div>
            <span>No disponible</span>
          </div>
          <div className="legend-item">
            <div className="legend-color weekend"></div>
            <span>Fin de semana</span>
          </div>
        </div>
      </div>
    </div>
  );
}
