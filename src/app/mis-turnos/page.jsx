"use client";

import { useState } from "react";
import { useTurnos } from "../context/TurnosContext";
import { useAuth } from "../context/AuthContext";
import {
  FaCalendarCheck,
  FaUserMd,
  FaUser,
  FaClock,
  FaTrash,
  FaCalendarAlt,
  FaStar,
  FaRegStar,
  FaCheckCircle,
} from "react-icons/fa";
import "./mis-turnos.css";
import { formatDate, parseDateTimeLocal } from "../context/Date";

export default function MisTurnosPage() {
  const {
    obtenerTurnosUsuario,
    cancelarTurno,
    calificarProfesional,
    obtenerPromedio,
    hasRatedTurno,
    profesionales,
    horarios,
  } = useTurnos();
  const { currentUser } = useAuth();

  const [showCancelConfirm, setShowCancelConfirm] = useState(null);
  const [cancelError, setCancelError] = useState("");

  const [rateModal, setRateModal] = useState(null);
  const [ratingScore, setRatingScore] = useState(0);
  const [hoverScore, setHoverScore] = useState(0);

  const isMedico =
    currentUser?.rol === "medico" || currentUser?.role === "doctor";

  const misTurnosRaw = obtenerTurnosUsuario() || [];

  const misTurnos = misTurnosRaw.map((turno) => {
    if (turno.fecha && turno.hora) return turno;
    const horarioData = horarios.find(
      (h) => h.id === turno.horarioId || h._id === turno.horarioId
    );
    if (horarioData) {
      return {
        ...turno,
        fecha: horarioData.fecha,
        hora: horarioData.hora,
        profesionalId: turno.profesionalId || horarioData.profesionalId,
      };
    }
    return turno;
  });

  const formatTime = (timeString) => timeString;

  const getProfessionalById = (id) => {
    return profesionales.find(
      (p) => String(p.id) === String(id) || String(p._id) === String(id)
    );
  };

  const handleCancelTurno = async (turnoId) => {
    const ok = await cancelarTurno(turnoId);
    if (ok) {
      setShowCancelConfirm(null);
      setCancelError("");
    } else {
      setCancelError("No se pudo cancelar el turno");
    }
  };

  const handleRateSubmit = () => {
    if (rateModal && ratingScore > 0) {
      calificarProfesional(rateModal.profesionalId, ratingScore, rateModal.id);
      setRateModal(null);
      setRatingScore(0);
      setHoverScore(0);
    }
  };

  const isUpcoming = (fecha, hora) => {
    if (!fecha || !hora) return false;
    return parseDateTimeLocal(fecha, hora) > new Date();
  };

  const canCancelLocal = (fecha, hora) => {
    if (!fecha || !hora) return false;
    const turnoDateTime = parseDateTimeLocal(fecha, hora);
    const now = new Date();
    return turnoDateTime.getTime() - now.getTime() >= 86400000;
  };

  const turnosValidos = misTurnos.filter((t) => t.fecha && t.hora);
  const upcomingTurnos = turnosValidos.filter((turno) =>
    isUpcoming(turno.fecha, turno.hora)
  );
  const pastTurnos = turnosValidos.filter(
    (turno) => !isUpcoming(turno.fecha, turno.hora)
  );

  const renderStaticStars = (score) => {
    return (
      <div className="stars-display">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star-icon-card ${
              star <= Math.round(score) ? "filled" : "empty"
            }`}
          >
            {star <= Math.round(score) ? <FaStar /> : <FaRegStar />}
          </span>
        ))}
      </div>
    );
  };

  const renderTurnoCard = (turno, statusClass, statusText) => {
    const profesional = getProfessionalById(turno.profesionalId);
    const pacienteNombre = turno.usuario?.nombre || "Paciente";
    const pacienteEmail = turno.usuario?.email || "";

    const promedioMedico =
      !isMedico && profesional
        ? obtenerPromedio(profesional.id || profesional._id)
        : 0;

    const turnoId = turno._id || turno.id;
    const isRated = hasRatedTurno(turnoId);

    return (
      <div key={turnoId} className={`turno-card ${statusClass}`}>
        <div className="turno-header">
          <div className="profesional-info">
            <img
              src={!isMedico ? profesional?.avatar : null}
              alt={!isMedico ? profesional?.nombre : pacienteNombre}
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  !isMedico ? profesional?.nombre || "Dr" : pacienteNombre
                )}&background=${
                  !isMedico ? "3b82f6" : "10b981"
                }&color=fff&size=60`;
              }}
            />
            <div>
              <h4>
                {!isMedico
                  ? profesional?.nombre || "Profesional"
                  : pacienteNombre}
              </h4>
              <p className="especialidad">
                {!isMedico ? (
                  <>
                    {" "}
                    <FaUserMd /> {profesional?.especialidad || "General"}{" "}
                  </>
                ) : (
                  <>
                    {" "}
                    <FaUser /> {pacienteEmail || "Paciente"}{" "}
                  </>
                )}
              </p>

              {!isMedico && renderStaticStars(promedioMedico)}
            </div>
          </div>
          <div
            className={`turno-status ${
              statusClass === "past" ? "completed" : "confirmed"
            }`}
          >
            {statusText}
          </div>
        </div>

        <div className="turno-details">
          <div className="detail">
            <FaCalendarAlt /> <span>{formatDate(turno.fecha)}</span>
          </div>
          <div className="detail">
            <FaClock /> <span>{formatTime(turno.hora)}</span>
          </div>
        </div>

        <div className="turno-actions">
          {statusClass === "upcoming" && (
            <button
              className={`btn-cancel ${
                !canCancelLocal(turno.fecha, turno.hora) ? "disabled" : ""
              }`}
              onClick={() => {
                if (canCancelLocal(turno.fecha, turno.hora))
                  setShowCancelConfirm(turno._id || turno.id);
              }}
              disabled={!canCancelLocal(turno.fecha, turno.hora)}
            >
              <FaTrash /> Cancelar
            </button>
          )}

          {statusClass === "past" && !isMedico && (
            <>
              {!isRated ? (
                <button
                  className="btn-primary"
                  onClick={() =>
                    setRateModal({
                      id: turnoId,
                      profesionalId: turno.profesionalId,
                      nombre: profesional?.nombre,
                    })
                  }
                >
                  <FaStar /> CALIFICA ESTE TURNO
                </button>
              ) : (
                <div className="already-rated-badge">
                  <FaCheckCircle /> Ya calificaste
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mis-turnos-container">
      <div className="mis-turnos-header">
        <h1>{isMedico ? "Agenda Médica" : "Mis Turnos"}</h1>
        <p>
          {isMedico
            ? "Gestiona tus pacientes del día"
            : "Gestiona tus citas médicas"}
        </p>
        {cancelError && <p className="error-message">{cancelError}</p>}
      </div>

      {misTurnos.length === 0 ? (
        <div className="no-turnos">
          <FaCalendarCheck size={64} />
          <h3>
            {isMedico
              ? "No tienes pacientes agendados"
              : "No tienes turnos reservados"}
          </h3>
          {!isMedico && (
            <>
              <p>Reserva tu primer turno para comenzar</p>
              <a href="/turnos" className="btn-primary">
                <FaCalendarAlt /> Reservar Turno
              </a>
            </>
          )}
        </div>
      ) : (
        <>
          {upcomingTurnos.length > 0 && (
            <div className="turnos-section">
              <h2>{isMedico ? "Próximos Pacientes" : "Próximos Turnos"}</h2>
              <div className="turnos-grid">
                {upcomingTurnos.map((turno) =>
                  renderTurnoCard(turno, "upcoming", "Confirmado")
                )}
              </div>
            </div>
          )}
          {pastTurnos.length > 0 && (
            <div className="turnos-section">
              <h2>Historial</h2>
              <div className="turnos-grid">
                {pastTurnos.map((turno) =>
                  renderTurnoCard(turno, "past", "Completado")
                )}
              </div>
            </div>
          )}
        </>
      )}

      {showCancelConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>¿Cancelar turno?</h3>
            <p>Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowCancelConfirm(null)}
              >
                No, mantener
              </button>
              <button
                className="btn-danger"
                onClick={() => handleCancelTurno(showCancelConfirm)}
              >
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {rateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Calificar Atención</h3>
            <p>
              ¿Qué te pareció la atención de <strong>{rateModal.nombre}</strong>
              ?
            </p>
            <div className="modal-stars-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`modal-star ${
                    star <= (hoverScore || ratingScore) ? "filled" : "empty"
                  }`}
                  onMouseEnter={() => setHoverScore(star)}
                  onMouseLeave={() => setHoverScore(0)}
                  onClick={() => setRatingScore(star)}
                >
                  <FaStar />
                </span>
              ))}
            </div>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => {
                  setRateModal(null);
                  setRatingScore(0);
                }}
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={handleRateSubmit}
                disabled={ratingScore === 0}
              >
                Enviar Opinión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
