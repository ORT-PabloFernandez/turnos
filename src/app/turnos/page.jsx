'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTurnos } from '../context/TurnosContext';
import ProfessionalSelector from './ProfessionalSelector';
import CalendarView from './CalendarView';
import TimeSlotSelector from './TimeSlotSelector';
import BookingConfirmation from './BookingConfirmation';
import './turnos.css';

export default function TurnosPage() {
  const searchParams = useSearchParams();
  const { profesionales, reservarTurno, obtenerHorariosDisponiblesPorProfesional } = useTurnos();
  
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const router = useRouter();
  // Si viene un profesional en la URL, seleccionarlo automáticamente
  useEffect(() => {
    const profesionalId = searchParams.get('profesional');
    if (profesionalId) {
      const profesional = profesionales.find(p => p.id === parseInt(profesionalId));
      if (profesional) {
        setSelectedProfessional(profesional);
      }
    }
  }, [searchParams, profesionales]);

  const handleProfessionalSelect = (profesional) => {
    setSelectedProfessional(profesional);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  const handleTimeSlotSelect = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setShowConfirmation(true);
  };

  const handleBookingConfirm = () => {
    if (selectedTimeSlot) {
      const success = reservarTurno(selectedTimeSlot.id);
      if (success) {
        setBookingSuccess(true);
        // Ocultar mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setBookingSuccess(false);
          // TODO: agregar pantalla de loading
          router.push('/mis-turnos');
        }, 3000);
      }
    }
  };

  const handleBookingCancel = () => {
    setShowConfirmation(false);
    setSelectedTimeSlot(null);
  };

  const availableTimeSlots = selectedProfessional && selectedDate 
    ? obtenerHorariosDisponiblesPorProfesional(selectedProfessional.id, selectedDate)
    : [];

  return (
    <div className="turnos-container">
      <div className="turnos-header">
        <h1>Reservar Turno</h1>
        <p>Selecciona un profesional, fecha y horario para tu consulta</p>
      </div>

      {bookingSuccess && (
        <div className="success-message">
          <h3>¡Turno reservado exitosamente!</h3>
          <p>Recibirás una confirmación por email.</p>
        </div>
      )}

      <div className="booking-steps">
        <div className={`step ${selectedProfessional ? 'completed' : 'active'}`}>
          <span className="step-number">1</span>
          <span className="step-title">Profesional</span>
        </div>
        <div className={`step ${selectedDate ? 'completed' : selectedProfessional ? 'active' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-title">Fecha</span>
        </div>
        <div className={`step ${selectedTimeSlot ? 'completed' : selectedDate ? 'active' : ''}`}>
          <span className="step-number">3</span>
          <span className="step-title">Horario</span>
        </div>
        <div className={`step ${showConfirmation ? 'active' : ''}`}>
          <span className="step-number">4</span>
          <span className="step-title">Confirmar</span>
        </div>
      </div>

      <div className="booking-content">
        {!selectedProfessional && (
          <ProfessionalSelector 
            profesionales={profesionales}
            onSelect={handleProfessionalSelect}
          />
        )}

        {selectedProfessional && !selectedDate && (
          <CalendarView 
            profesional={selectedProfessional}
            onDateSelect={handleDateSelect}
            onBack={() => setSelectedProfessional(null)}
          />
        )}

        {selectedProfessional && selectedDate && !showConfirmation && (
          <TimeSlotSelector
            profesional={selectedProfessional}
            date={selectedDate}
            timeSlots={availableTimeSlots}
            onTimeSlotSelect={handleTimeSlotSelect}
            onBack={() => setSelectedDate(null)}
          />
        )}

        {showConfirmation && selectedTimeSlot && (
          <BookingConfirmation
            profesional={selectedProfessional}
            date={selectedDate}
            timeSlot={selectedTimeSlot}
            onConfirm={handleBookingConfirm}
            onCancel={handleBookingCancel}
          />
        )}
      </div>
    </div>
  );
}
