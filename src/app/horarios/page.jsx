"use client";

import { useState, useEffect } from "react";
import { useTurnos } from "../context/TurnosContext";
import {
  FaClock,
  FaUserMd,
  FaCalendarAlt,
  FaFilter,
} from "react-icons/fa";
import "./horarios.css";
import { formatDate } from "../context/Date";

export default function HorariosPage() {
  // Del contexto solo usamos profesionales y turnos reservados
  const { profesionales, turnosReservados } = useTurnos();

  // Filtros
  const [selectedProfessional, setSelectedProfessional] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [viewMode, setViewMode] = useState("all"); // 'available', 'occupied', 'all'

  // Horarios que vienen del backend
  const [horarios, setHorarios] = useState([]);

  // Estado de carga y error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const hoyStr = new Date().toISOString().split("T")[0];

  // Buscar profesional por id
  const getProfessionalById = (id) => {
    return profesionales.find((p) => p.id === id);
  };

  // Buscar turno asociado a un horario
  const getTurnoByHorarioId = (horarioId) => {
    return turnosReservados.find((t) => t.horarioId === horarioId);
  };

  // Llamada al backend con filtros
  const fetchHorarios = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      if (selectedProfessional !== "all") {
        params.append("profesionalId", selectedProfessional);
      }

      if (selectedDate) {
        params.append("fecha", selectedDate);
      }

      const queryString = params.toString();
      const url = queryString
        ? "http://localhost:3000/api/horarios?" + queryString
        : "http://localhost:3000/api/horarios";

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error("Error al obtener horarios");
      }

      const data = await res.json();
      setHorarios(data);
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al cargar los horarios");
    } finally {
      setLoading(false);
    }
  };

  // Cada vez que cambian los filtros, vuelvo a pedir al backend
  useEffect(() => {
    fetchHorarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProfessional, selectedDate, viewMode]);

  // Solo horarios desde hoy
const horariosDesdeHoy = horarios.filter((h) => h.fecha >= hoyStr);

// Aplicar filtro de estado (Todos / Solo disponibles / Solo ocupados)
const horariosFiltrados = horariosDesdeHoy.filter((h) => {
  if (viewMode === "available") return h.disponible;
  if (viewMode === "occupied") return !h.disponible;
  return true; // 'all'
});

  // Agrupar horarios por fecha
  const horariosPorFecha = horariosFiltrados.reduce((acc, horario) => {
    if (!acc[horario.fecha]) {
      acc[horario.fecha] = [];
    }
    acc[horario.fecha].push(horario);
    return acc;
  }, {});

  // Ordenar fechas
  const fechasOrdenadas = Object.keys(horariosPorFecha).sort();

  const fechasDisponibles = Array.from(
  new Set(horariosDesdeHoy.map((h) => h.fecha))
).sort();

  // Estadísticas en base a lo que devolvió el backend
  const getStats = () => {
  const total = horariosFiltrados.length;
  const disponibles = horariosFiltrados.filter((h) => h.disponible).length;
  const ocupados = horariosFiltrados.filter((h) => !h.disponible).length;
  return { total, disponibles, ocupados };
};

  const stats = getStats();

  return (
    <div className="horarios-container">
      <div className="horarios-header">
        <h1>Gestión de Horarios</h1>
        <p>Administra la disponibilidad de horarios por profesional</p>
      </div>

      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <FaClock />
          </div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Horarios (según filtros)</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon available">
            <FaCalendarAlt />
          </div>
          <div className="stat-info">
            <h3>{stats.disponibles}</h3>
            <p>Disponibles</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon occupied">
            <FaUserMd />
          </div>
          <div className="stat-info">
            <h3>{stats.ocupados}</h3>
            <p>Ocupados</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <div className="filters-header">
          <h3>
            <FaFilter /> Filtros
          </h3>
        </div>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Profesional</label>
            <select
              value={selectedProfessional}
              onChange={(e) => setSelectedProfessional(e.target.value)}
            >
              <option value="all">Todos los profesionales</option>
              {profesionales.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.nombre} - {prof.especialidad}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Fecha</label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            >
              <option value="">Todas las fechas</option>
              {fechasDisponibles.map((date) => (
                <option key={date} value={date}>
                  {formatDate(date)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Estado</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="available">Solo disponibles</option>
              <option value="occupied">Solo ocupados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de horarios */}
      <div className="horarios-content">
        {loading ? (
          <div className="no-horarios">
            <FaClock size={32} />
            <h3>Cargando horarios...</h3>
          </div>
        ) : error ? (
          <div className="no-horarios">
            <FaClock size={32} />
            <h3>{error}</h3>
          </div>
        ) : fechasOrdenadas.length === 0 ? (
          <div className="no-horarios">
            <FaClock size={48} />
            <h3>No hay horarios que mostrar</h3>
            <p>Ajusta los filtros para ver más resultados</p>
          </div>
        ) : (
          fechasOrdenadas.map((fecha) => (
            <div key={fecha} className="fecha-section">
              <h3 className="fecha-title">{formatDate(fecha)}</h3>

              <div className="horarios-grid">
                {horariosPorFecha[fecha]
                  .sort((a, b) => {
                    const [ha, ma] = a.hora.split(":").map(Number);
                    const [hb, mb] = b.hora.split(":").map(Number);

                    if (ha !== hb) return ha - hb;
                    return ma - mb;
                  })
                  .map((horario) => {
                    const profesional = getProfessionalById(
                      horario.profesionalId
                    );
                    const turno = getTurnoByHorarioId(horario.horarioId || horario.id || horario._id);

                    return (
                      <div
                        key={horario._id || horario.id}
                        className={`horario-card ${
                          horario.disponible ? "available" : "occupied"
                        }`}
                      >
                        <div className="horario-header">
                          <div className="profesional-info">
                            <img
                              src={profesional?.avatar}
                              alt={profesional?.nombre}
                              onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  profesional?.nombre || "Doctor"
                                )}&background=3b82f6&color=fff&size=40`;
                              }}
                            />
                            <div>
                              <h4>{profesional?.nombre}</h4>
                              <p>{profesional?.especialidad}</p>
                            </div>
                          </div>
                          <div
                            className={`status-badge ${
                              horario.disponible ? "available" : "occupied"
                            }`}
                          >
                            {horario.disponible ? "Disponible" : "Ocupado"}
                          </div>
                        </div>

                        <div className="horario-time">
                          <FaClock />
                          <span>{horario.hora}</span>
                        </div>

                        {!horario.disponible && turno && (
                          <div className="paciente-info">
                            <h5>Paciente:</h5>
                            <p>{turno.usuario.nombre}</p>
                            <p className="email">{turno.usuario.email}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
