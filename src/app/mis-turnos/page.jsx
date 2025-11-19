'use client';

import { useState } from 'react';
import { useTurnos } from '../context/TurnosContext';
import { FaCalendarCheck, FaUserMd, FaClock, FaTrash, FaCalendarAlt } from 'react-icons/fa';
import './mis-turnos.css';

export default function MisTurnosPage() {
  const { obtenerTurnosUsuario, cancelarTurno, profesionales } = useTurnos();
  const [showCancelConfirm, setShowCancelConfirm] = useState(null);
  
  const misTurnos = obtenerTurnosUsuario();
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  const getProfessionalById = (id) => {
    return profesionales.find(p => p.id === id);
  };

  const handleCancelTurno = (turnoId) => {
    const success = cancelarTurno(turnoId);
    if (success) {
      setShowCancelConfirm(null);
    }
  };

  const isUpcoming = (fecha, hora) => {
    const turnoDateTime = new Date(`${fecha}T${hora}`);
    return turnoDateTime > new Date();
  };

  const upcomingTurnos = misTurnos.filter(turno => isUpcoming(turno.fecha, turno.hora));
  const pastTurnos = misTurnos.filter(turno => !isUpcoming(turno.fecha, turno.hora));

  return (
    <div className="mis-turnos-container">
      <div className="mis-turnos-header">
        <h1>Mis Turnos</h1>
        <p>Gestiona tus citas médicas</p>
      </div>

      {misTurnos.length === 0 ? (
        <div className="no-turnos">
          <FaCalendarCheck size={64} />
          <h3>No tienes turnos reservados</h3>
          <p>Reserva tu primer turno para comenzar</p>
          <a href="/turnos" className="btn-primary">
            <FaCalendarAlt /> Reservar Turno
          </a>
        </div>
      ) : (
        <>
          {upcomingTurnos.length > 0 && (
            <div className="turnos-section">
              <h2>Próximos Turnos</h2>
              <div className="turnos-grid">
                {upcomingTurnos.map((turno) => {
                  const profesional = getProfessionalById(turno.profesionalId);
                  return (
                    <div key={turno.id} className="turno-card upcoming">
                      <div className="turno-header">
                        <div className="profesional-info">
                          <img 
                            src={profesional?.avatar} 
                            alt={profesional?.nombre}
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profesional?.nombre || 'Doctor')}&background=3b82f6&color=fff&size=60`;
                            }}
                          />
                          <div>
                            <h4>{profesional?.nombre}</h4>
                            <p className="especialidad">
                              <FaUserMd /> {profesional?.especialidad}
                            </p>
                          </div>
                        </div>
                        <div className="turno-status confirmed">
                          Confirmado
                        </div>
                      </div>

                      <div className="turno-details">
                        <div className="detail">
                          <FaCalendarAlt />
                          <span>{formatDate(turno.fecha)}</span>
                        </div>
                        <div className="detail">
                          <FaClock />
                          <span>{formatTime(turno.hora)}</span>
                        </div>
                      </div>

                      <div className="turno-actions">
                        <button 
                          className="btn-cancel"
                          onClick={() => setShowCancelConfirm(turno.id)}
                        >
                          <FaTrash /> Cancelar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {pastTurnos.length > 0 && (
            <div className="turnos-section">
              <h2>Historial de Turnos</h2>
              <div className="turnos-grid">
                {pastTurnos.map((turno) => {
                  const profesional = getProfessionalById(turno.profesionalId);
                  return (
                    <div key={turno.id} className="turno-card past">
                      <div className="turno-header">
                        <div className="profesional-info">
                          <img 
                            src={profesional?.avatar} 
                            alt={profesional?.nombre}
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profesional?.nombre || 'Doctor')}&background=6b7280&color=fff&size=60`;
                            }}
                          />
                          <div>
                            <h4>{profesional?.nombre}</h4>
                            <p className="especialidad">
                              <FaUserMd /> {profesional?.especialidad}
                            </p>
                          </div>
                        </div>
                        <div className="turno-status completed">
                          Completado
                        </div>
                      </div>

                      <div className="turno-details">
                        <div className="detail">
                          <FaCalendarAlt />
                          <span>{formatDate(turno.fecha)}</span>
                        </div>
                        <div className="detail">
                          <FaClock />
                          <span>{formatTime(turno.hora)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de confirmación de cancelación */}
      {showCancelConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>¿Cancelar turno?</h3>
            <p>Esta acción no se puede deshacer. El horario quedará disponible para otros pacientes.</p>
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowCancelConfirm(null)}
              >
                No, mantener turno
              </button>
              <button 
                className="btn-danger"
                onClick={() => handleCancelTurno(showCancelConfirm)}
              >
                Sí, cancelar turno
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
