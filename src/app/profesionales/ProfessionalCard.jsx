"use client";

import Link from "next/link";
import { FaUserMd, FaCalendarAlt, FaEnvelope } from "react-icons/fa";
import { useTurnos } from "../context/TurnosContext";

export default function ProfessionalCard({ profesional }) {
  const {
    obtenerHorariosDisponiblesPorProfesional,
    obtenerTurnosPorProfesional,
  } = useTurnos();

  const horariosDisponibles = obtenerHorariosDisponiblesPorProfesional(
    profesional.id
  );
  const turnosReservados = obtenerTurnosPorProfesional(profesional.id);

  return (
    <div className="professional-card">
      <div className="professional-avatar">
        <img
          src={profesional.avatar}
          alt={profesional.nombre}
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
              profesional.nombre
            )}&background=3b82f6&color=fff&size=120`;
          }}
        />
      </div>

      <div className="professional-info">
        <h3>{profesional.nombre}</h3>
        <p className="professional-specialty">
          <FaUserMd /> {profesional.especialidad}
        </p>
        <p className="professional-email">
          <FaEnvelope />
          <span className="email-text" title={profesional.email}>
            {profesional.email}
          </span>
        </p>
      </div>

      <div className="professional-stats">
        <div className="stat">
          <span className="stat-number">{horariosDisponibles.length}</span>
          <span className="stat-label">Horarios disponibles</span>
        </div>
        <div className="stat">
          <span className="stat-number">{turnosReservados.length}</span>
          <span className="stat-label">Turnos reservados</span>
        </div>
      </div>

      <div className="professional-actions">
        <Link
          href={`/turnos?profesional=${profesional.id}`}
          className="btn-primary"
        >
          <FaCalendarAlt /> Ver Horarios
        </Link>
      </div>
    </div>
  );
}
