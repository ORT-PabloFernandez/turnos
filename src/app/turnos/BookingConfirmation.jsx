'use client';

import { FaUserMd, FaCalendarAlt, FaClock, FaCheck, FaTimes } from 'react-icons/fa';
import { useTurnos } from '../context/TurnosContext';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../context/Date';

export default function BookingConfirmation({ profesional, date, timeSlot, onConfirm, onCancel }) {
  const { currentUser } = useAuth();

  return (
    <div className="booking-confirmation">
      <div className="confirmation-header">
        <h2>Confirmar Reserva</h2>
        <p>Por favor revisa los detalles de tu turno antes de confirmar</p>
      </div>

      <div className="confirmation-details">
        <div className="detail-card">
          <div className="detail-icon">
            <FaUserMd />
          </div>
          <div className="detail-info">
            <h4>Profesional</h4>
            <div className="professional-info">
              <img 
                src={profesional.avatar} 
                alt={profesional.nombre} 
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profesional.nombre)}&background=3b82f6&color=fff&size=80`;
                }}
                />
              <div>
                <p className="name">{profesional.nombre}</p>
                <p className="specialty">{profesional.especialidad}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-icon">
            <FaCalendarAlt />
          </div>
          <div className="detail-info">
            <h4>Fecha</h4>
            <p>{formatDate(date)}</p>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-icon">
            <FaClock />
          </div>
          <div className="detail-info">
            <h4>Horario</h4>
            <p>{timeSlot.hora}</p>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-icon">
            <FaUserMd />
          </div>
          <div className="detail-info">
            <h4>Paciente</h4>
            <p>{currentUser.username}</p>
            <p className="email">{currentUser.email}</p>
          </div>
        </div>
      </div>

      <div className="confirmation-actions">
        <button className="btn-cancel" onClick={onCancel}>
          <FaTimes /> Cancelar
        </button>
        <button className="btn-confirm" onClick={onConfirm}>
          <FaCheck /> Confirmar Turno
        </button>
      </div>

      <div className="confirmation-note">
        <p><strong>Nota:</strong> Recibirás una confirmación por email una vez que confirmes el turno. 
        Si necesitas cancelar o reprogramar, puedes hacerlo desde la sección "Mis Turnos".</p>
      </div>
    </div>
  );
}
