"use client";

import { useState } from "react";
// CORRECCIÓN: Rutas relativas correctas (subimos un nivel con ..)
import { useTurnos } from "../context/TurnosContext";
import { useAuth } from "../context/AuthContext";
import {
  FaCalendarCheck,
  FaUserMd,
  FaUser,
  FaClock,
  FaTrash,
  FaCalendarAlt,
} from "react-icons/fa";
import "./mis-turnos.css";
import { formatDate, parseDateTimeLocal } from "../context/Date";

export default function MisTurnosPage() {
  const { obtenerTurnosUsuario, cancelarTurno, profesionales, horarios } =
    useTurnos();
  const { currentUser } = useAuth(); // Obtenemos el usuario actual

  const [showCancelConfirm, setShowCancelConfirm] = useState(null);
  const [cancelError, setCancelError] = useState("");

  // Detectamos si es médico para adaptar la vista
  const isMedico =
    currentUser?.rol === "medico" || currentUser?.role === "doctor";

  const misTurnosRaw = obtenerTurnosUsuario() || [];

  // ENRIQUECIMIENTO DE DATOS
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

  const formatTime = (timeString) => {
    return timeString;
  };

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

  const isUpcoming = (fecha, hora) => {
    if (!fecha || !hora) return false;
    return parseDateTimeLocal(fecha, hora) > new Date();
  };

  const canCancelLocal = (fecha, hora) => {
    if (!fecha || !hora) return false;
    const turnoDateTime = parseDateTimeLocal(fecha, hora);
    const now = new Date();
    const diff = turnoDateTime.getTime() - now.getTime();
    const MILISEGUNDOS_EN_24HS = 24 * 60 * 60 * 1000;
    return diff >= MILISEGUNDOS_EN_24HS;
  };

  const turnosValidos = misTurnos.filter((t) => t.fecha && t.hora);

  const upcomingTurnos = turnosValidos.filter((turno) =>
    isUpcoming(turno.fecha, turno.hora)
  );
  const pastTurnos = turnosValidos.filter(
    (turno) => !isUpcoming(turno.fecha, turno.hora)
  );

  // Renderizado condicional de la tarjeta según el rol
  const renderTurnoCard = (turno, statusClass, statusText) => {
    // Si soy paciente, busco info del médico
    const profesional = getProfessionalById(turno.profesionalId);

    // Si soy médico, uso la info del paciente que viene en el turno
    const pacienteNombre = turno.usuario?.nombre || "Paciente";
    const pacienteEmail = turno.usuario?.email || "";

    return (
      <div key={turno._id || turno.id} className={`turno-card ${statusClass}`}>
        <div className="turno-header">
          <div className="profesional-info">
            {/* AVATAR: Diferente si es médico o paciente */}
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
              {/* NOMBRE Y SUBTITULO */}
              <h4>
                {!isMedico
                  ? profesional?.nombre || "Profesional"
                  : pacienteNombre}
              </h4>
              <p className="especialidad">
                {!isMedico ? (
                  <>
                    <FaUserMd /> {profesional?.especialidad || "General"}
                  </>
                ) : (
                  <>
                    <FaUser /> {pacienteEmail || "Paciente"}
                  </>
                )}
              </p>
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
            <FaCalendarAlt />
            <span>{formatDate(turno.fecha)}</span>
          </div>
          <div className="detail">
            <FaClock />
            <span>{formatTime(turno.hora)}</span>
          </div>
        </div>

        {/* Solo mostramos botón cancelar en turnos futuros */}
        {statusClass === "upcoming" && (
          <div className="turno-actions">
            <button
              className={`btn-cancel ${
                !canCancelLocal(turno.fecha, turno.hora) ? "disabled" : ""
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
                  : "Menos de 24hs para el turno"
              }
            >
              <FaTrash /> Cancelar
            </button>
          </div>
        )}
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
          {turnosValidos.length === 0 && (
            <div
              className="error-message"
              style={{ textAlign: "center", marginTop: "20px" }}
            >
              <p>Se encontraron reservas, pero faltan datos de fecha/hora.</p>
            </div>
          )}

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
            <p>
              Esta acción no se puede deshacer. El horario quedará disponible.
            </p>
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
    </div>
  );
}
