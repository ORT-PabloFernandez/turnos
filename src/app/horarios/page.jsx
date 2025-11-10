'use client';

import { useState } from 'react';
import { useTurnos } from '../context/TurnosContext';
import { FaClock, FaUserMd, FaCalendarAlt, FaEye, FaFilter } from 'react-icons/fa';
import './horarios.css';
import { toAMD, formatDate } from '../context/Date';

export default function HorariosPage() {
  const { profesionales, horariosDisponibles, turnosReservados } = useTurnos();
  const [selectedProfessional, setSelectedProfessional] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [viewMode, setViewMode] = useState('available'); // 'available', 'occupied', 'all'

  /* const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }; */


  const getProfessionalById = (id) => {
    return profesionales.find(p => p.id === id);
  };

  const getTurnoByHorarioId = (horarioId) => {
    return turnosReservados.find(t => t.horarioId === horarioId);
  };

  const filteredHorarios = horariosDisponibles.filter(horario => {
    const matchesProfessional = selectedProfessional === 'all' || horario.profesionalId === parseInt(selectedProfessional);
    const matchesDate = !selectedDate || horario.fecha === selectedDate;
    
    let matchesViewMode = true;
    if (viewMode === 'available') {
      matchesViewMode = horario.disponible;
    } else if (viewMode === 'occupied') {
      matchesViewMode = !horario.disponible;
    }
    
    return matchesProfessional && matchesDate && matchesViewMode;
  });

  // Agrupar horarios por fecha
  const horariosPorFecha = filteredHorarios.reduce((acc, horario) => {
    if (!acc[horario.fecha]) {
      acc[horario.fecha] = [];
    }
    acc[horario.fecha].push(horario);
    return acc;
  }, {});

  // Ordenar fechas
  const fechasOrdenadas = Object.keys(horariosPorFecha).sort();

  const getNextWeekDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(toAMD(date));
    }
    return dates;
  };

  const getStats = () => {
    const total = horariosDisponibles.length;
    const disponibles = horariosDisponibles.filter(h => h.disponible).length;
    const ocupados = total - disponibles;
    
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
            <p>Total Horarios</p>
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
          <h3><FaFilter /> Filtros</h3>
        </div>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Profesional</label>
            <select 
              value={selectedProfessional} 
              onChange={(e) => setSelectedProfessional(e.target.value)}
            >
              <option value="all">Todos los profesionales</option>
              {profesionales.map(prof => (
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
              {getNextWeekDates().map(date => (
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
        {fechasOrdenadas.length === 0 ? (
          <div className="no-horarios">
            <FaClock size={48} />
            <h3>No hay horarios que mostrar</h3>
            <p>Ajusta los filtros para ver más resultados</p>
          </div>
        ) : (
          fechasOrdenadas.map(fecha => (
            <div key={fecha} className="fecha-section">
              <h3 className="fecha-title">
                {formatDate(fecha)}
              </h3>
              
              <div className="horarios-grid">
                {horariosPorFecha[fecha]
                  .sort((a, b) => a.hora.localeCompare(b.hora))
                  .map(horario => {
                    const profesional = getProfessionalById(horario.profesionalId);
                    const turno = getTurnoByHorarioId(horario.id);
                    
                    return (
                      <div 
                        key={horario.id} 
                        className={`horario-card ${horario.disponible ? 'available' : 'occupied'}`}
                      >
                        <div className="horario-header">
                          <div className="profesional-info">
                            <img 
                              src={profesional?.avatar} 
                              alt={profesional?.nombre}
                              onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profesional?.nombre || 'Doctor')}&background=3b82f6&color=fff&size=40`;
                              }}
                            />
                            <div>
                              <h4>{profesional?.nombre}</h4>
                              <p>{profesional?.especialidad}</p>
                            </div>
                          </div>
                          <div className={`status-badge ${horario.disponible ? 'available' : 'occupied'}`}>
                            {horario.disponible ? 'Disponible' : 'Ocupado'}
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
