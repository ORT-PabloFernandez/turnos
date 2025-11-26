'use client';

import { FaArrowLeft, FaClock } from 'react-icons/fa';
import { formatDate } from '../context/Date';

export default function TimeSlotSelector({ profesional, date, timeSlots, onTimeSlotSelect, onBack }) {

  const groupTimeSlotsByPeriod = (slots) => {
    const morning = slots.filter(slot => {
      const hour = parseInt(slot.hora.split(':')[0]);
      return hour < 12;
    });
    
    const afternoon = slots.filter(slot => {
      const hour = parseInt(slot.hora.split(':')[0]);
      return hour >= 12;
    });

    return { morning, afternoon };
  };

  const { morning, afternoon } = groupTimeSlotsByPeriod(timeSlots);

  return (
    <div className="time-slot-selector">
      <div className="selector-header">
        <button className="back-button" onClick={onBack}>
          <FaArrowLeft /> Cambiar Fecha
        </button>
        <div className="selected-info">
          <div className="selected-professional">
            <img src={profesional.avatar} alt={profesional.nombre} />
            <div>
              <h3>{profesional.nombre}</h3>
              <p>{profesional.especialidad}</p>
            </div>
          </div>
          <div className="selected-date">
            <h4>{formatDate(date)}</h4>
          </div>
        </div>
      </div>

      <div className="time-slots-container">
        <h2>Selecciona un Horario</h2>
        
        {timeSlots.length === 0 ? (
          <div className="no-slots">
            <FaClock size={48} />
            <h3>No hay horarios disponibles</h3>
            <p>Por favor selecciona otra fecha</p>
          </div>
        ) : (
          <>
            {morning.length > 0 && (
              <div className="time-period">
                <h3>Mañana</h3>
                <div className="time-slots-grid">
                  {morning.map((slot) => (
                    <button
                      key={slot._id}
                      className="time-slot"
                      onClick={() => onTimeSlotSelect(slot)}
                    >
                      <FaClock />
                      {slot.hora}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {afternoon.length > 0 && (
              <div className="time-period">
                <h3>Tarde</h3>
                <div className="time-slots-grid">
                  {afternoon.map((slot) => (
                    <button
                      key={slot._id}
                      className="time-slot"
                      onClick={() => onTimeSlotSelect(slot)}
                    >
                      <FaClock />
                      {slot.hora}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
