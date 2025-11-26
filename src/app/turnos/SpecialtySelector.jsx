'use client';

import { FaUserMd } from 'react-icons/fa';

export default function SpecialtySelector({ specialties, onSelect, onBack }) {
  return (
    <div className="professional-selector">
      <h2>Selecciona una Especialidad</h2>

      <div className="professionals-grid">
        {specialties.map((especialidad) => (
          <div
            key={especialidad._id}
            className="professional-option"
            onClick={() => onSelect(especialidad.especialidad)}
          >
            <div className="professional-avatar">
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '2rem',
                }}
              >
                <FaUserMd />
              </div>
            </div>

            <div className="professional-details">
              <h3 style={{ textTransform: 'capitalize' }}>{especialidad.especialidad}</h3>
              <p style={{ color: '#666' }}>Haz clic para continuar</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
