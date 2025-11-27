'use client';

import { FaUserMd, FaArrowLeft } from 'react-icons/fa';

export default function ProfessionalSelector({ profesionales, onSelect, onBack }) {
  return (
    <div className="professional-selector">
      {onBack && (
        <button
          className="back-button"
          onClick={onBack}
        >
          <FaArrowLeft /> Cambiar Especialidad
        </button>
      )}
      <h2>Selecciona un Profesional</h2>
      <div className="professionals-grid">
        {profesionales.map((profesional) => (
          <div 
            key={profesional.id}
            className="professional-option"
            onClick={() => onSelect(profesional)}
          >
            <div className="professional-avatar">
              <img 
                src={profesional.avatar} 
                alt={profesional.nombre}
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profesional.nombre)}&background=3b82f6&color=fff&size=80`;
                }}
              />
            </div>
            <div className="professional-details">
              <h3>{profesional.nombre}</h3>
              <p><FaUserMd /> {profesional.especialidad}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
