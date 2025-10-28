'use client';

import { useTurnos } from '../context/TurnosContext';
import ProfessionalCard from './ProfessionalCard';
import './profesionales.css';

export default function ProfesionalesPage() {
  const { profesionales } = useTurnos();

  return (
    <div className="profesionales-container">
      <div className="profesionales-header">
        <h1>Profesionales Disponibles</h1>
        <p>Selecciona un profesional para ver sus horarios disponibles</p>
      </div>
      
      <div className="profesionales-grid">
        {profesionales.map((profesional) => (
          <ProfessionalCard key={profesional.id} profesional={profesional} />
        ))}
      </div>
    </div>
  );
}
