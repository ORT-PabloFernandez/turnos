'use client';

import { useEffect, useState } from 'react';
import { useTurnos } from '../context/TurnosContext';
import ProfessionalCard from './ProfessionalCard';
import './profesionales.css';

export default function ProfesionalesPage() {
  // const { profesionales } = useTurnos();
  const [profesionales, setProfesionales] = useState([])

  useEffect(() => {
    async function fetchProfesionales(){
    try{
      const response = await fetch('http://localhost:3000/api/profesionales');
      const data = await response.json();
      console.log(data)
      setProfesionales(data)
    }catch (error){
      console.log(error)
    }
  }
   fetchProfesionales(); 
  },[])

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
