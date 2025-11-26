"use client";

import { useState } from "react";
import { useTurnos } from "../context/TurnosContext";
import {
  FaCalendarCheck,
  FaUserMd,
  FaClock,
  FaTrash,
  FaCalendarAlt,
} from "react-icons/fa";
import "./mis-turnos.css";
import { formatDate, parseDateTimeLocal } from "../context/Date";

export default function MisTurnosPage() {
  const { obtenerTurnosUsuario, cancelarTurno, profesionales } =
    useTurnos();
  const [showCancelConfirm, setShowCancelConfirm] = useState(null);

  const misTurnos = obtenerTurnosUsuario() || [];
  const formatTime = (timeString) => {
    return timeString;
  };

  const getProfessionalById = (id) => {
    return profesionales.find((p) => p.id === id);
  };

  const [cancelError, setCancelError] = useState("");

  const handleCancelTurno = async (turnoId) => {
  const ok = await cancelarTurno(turnoId);    

  if (ok) {
    setShowCancelConfirm(null);
    setCancelError("");
  } else {
    setCancelError("No se pudo cancelar el turno");
  }
};

  const isUpcoming = (fecha, hora) => {
    return parseDateTimeLocal(fecha, hora) > new Date();
  };

  const canCancelLocal = (fecha, hora) => {
    const turnoDateTime = parseDateTimeLocal(fecha, hora);
    const now = new Date();

    const diff = turnoDateTime.getTime() - now.getTime();
    const MILISEGUNDOS_EN_24HS = 24 * 60 * 60 * 1000;

    return diff >= MILISEGUNDOS_EN_24HS;
  };

  const turnosValidos = misTurnos.filter(
  (t) => t.fecha && t.hora
  );

  const upcomingTurnos = turnosValidos.filter((turno) =>
    isUpcoming(turno.fecha, turno.hora)
  );
  const pastTurnos = turnosValidos.filter(
    (turno) => !isUpcoming(turno.fecha, turno.hora)
  );

  return (
    <div className="mis-turnos-container">
      <div className="mis-turnos-header">
        <h1>Mis Turnos</h1>
        <p>Gestiona tus citas médicas</p>

        {cancelError && <p className="error-message">{cancelError}</p>}
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
                    <div key={turno._id || turno._id} className="turno-card upcoming">
                      <div className="turno-header">
                        <div className="profesional-info">
                          <img
                            src={profesional?.avatar}
                            alt={profesional?.nombre}
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                profesional?.nombre || "Doctor"
                              )}&background=3b82f6&color=fff&size=60`;
                            }}
                          />
                          <div>
                            <h4>{profesional?.nombre}</h4>
                            <p className="especialidad">
                              <FaUserMd /> {profesional?.especialidad}
                            </p>
                          </div>
                        </div>
                        <div className="turno-status confirmed">Confirmado</div>
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
                          className={`btn-cancel ${
                            !canCancelLocal(turno.fecha, turno.hora)
                              ? "disabled"
                              : ""
                          }`}
                          onClick={() => {
                            if (canCancelLocal(turno.fecha, turno.hora)) {
                              setShowCancelConfirm(turno._id || turno.id);
                            }
                          }}
                          disabled={!canCancelLocal(turno.fecha, turno.hora)}
                          title={
                            canCancelLocal(turno.fecha, turno.hora)
                              ? "Cancelar turno"
                              : "Este turno no se puede cancelar porque faltan menos de 24 horas"
                          }
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
                    <div key={turno._id || turno._id} className="turno-card past">
                      <div className="turno-header">
                        <div className="profesional-info">
                          <img
                            src={profesional?.avatar}
                            alt={profesional?.nombre}
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                profesional?.nombre || "Doctor"
                              )}&background=6b7280&color=fff&size=60`;
                            }}
                          />
                          <div>
                            <h4>{profesional?.nombre}</h4>
                            <p className="especialidad">
                              <FaUserMd /> {profesional?.especialidad}
                            </p>
                          </div>
                        </div>
                        <div className="turno-status completed">Completado</div>
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
            <p>
              Esta acción no se puede deshacer. El horario quedará disponible
              para otros pacientes.
            </p>
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
