"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTurnos } from "../context/TurnosContext";
import ProfessionalSelector from "./ProfessionalSelector";
import CalendarView from "./CalendarView";
import TimeSlotSelector from "./TimeSlotSelector";
import BookingConfirmation from "./BookingConfirmation";
import "./turnos.css";
import SpecialtySelector from "./SpecialtySelector";

export default function TurnosPage() {
  const searchParams = useSearchParams();
  const {
    profesionales,
    reservarTurno,
    obtenerHorariosDisponiblesPorProfesional,
  } = useTurnos();

  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [filteredProfessionals, setFilteredProfessionals] = useState([]);
  const router = useRouter();

  // useEffect(() => {
  //   const profesionalId = searchParams.get("profesional");
  //   if (profesionalId) {
  //     const profesional = profesionales.find(
  //       (p) => p.id === parseInt(profesionalId)
  //     );
  //     if (profesional) {
  //       setSelectedProfessional(profesional);
  //     }
  //   }
  // }, [searchParams, profesionales]);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/especialidades");
        const data = await res.json();
        setSpecialties(data);
      } catch (err) {
        console.error("Error loading specialties:", err);
      }
    };

    fetchSpecialties();
  }, []);

  const handleSpecialtySelect = async (especialidad) => {
    setSelectedSpecialty(especialidad);
    setSelectedProfessional(null);
    setSelectedDate(null);
    setSelectedTimeSlot(null);

    try {
      const res = await fetch(
        `http://localhost:3000/api/profesionales/especialidad/${especialidad}`
      );
      const data = await res.json();
      setFilteredProfessionals(data);
    } catch (err) {
      console.error("Error fetching professionals:", err);
    }
  };

  useEffect(() => {
    const profesionalId = searchParams.get("profesional");
    if (!profesionalId) return;

    const fetchProfesionalDirect = async () => {
      try {
         const profesionalEncontrar = profesionales.find(
         (p) => p.id === parseInt(profesionalId)
       );
        const res = await fetch(
          `http://localhost:3000/api/profesionales/${profesionalEncontrar._id}`
        );
        const profesional = await res.json();

        console.log(profesionales, "aqui")

        if (!profesional) return;
        setSelectedSpecialty(profesional.especialidad);
        setSelectedProfessional(profesional);

        const res2 = await fetch(
          `http://localhost:3000/api/profesionales/especialidad/${profesional.especialidad}`
        );
        const list = await res2.json();
        setFilteredProfessionals(list);
      } catch (err) {
        console.error("Error auto seleccionando:", err);
      }
    };

    fetchProfesionalDirect();
}, [searchParams]);

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

  const handleBookingConfirm = async () => {
    if (selectedTimeSlot) {
      const success = await reservarTurno(selectedTimeSlot._id);
      if (success) {
        setBookingSuccess(true);
        setTimeout(() => {
          setBookingSuccess(false);
          router.push("/mis-turnos");
        }, 3000);
      } else {
      console.error('No se pudo reservar el turno');
    }
  }
  };

  const handleBookingCancel = () => {
    setShowConfirmation(false);
    setSelectedTimeSlot(null);
  };

  const availableTimeSlots =
    selectedProfessional && selectedDate
      ? obtenerHorariosDisponiblesPorProfesional(
          selectedProfessional.id,
          selectedDate
        )
      : [];

  return (
    <div className="turnos-container">
      <div className="turnos-header">
        <h1>Reservar Turno</h1>
        <p>
          Selecciona una especialidad, profesional, fecha y horario para tu
          consulta
        </p>
      </div>

      {bookingSuccess && (
        <div className="success-loading" aria-live="polite">
          <div className="success-card">
            <div className="spinner" />
            <h3>¡Turno reservado exitosamente!</h3>
            <p className="subtext">Serás redirigido a Mis Turnos...</p>
          </div>
        </div>
      )}

      <div className="booking-steps">
        <div className={`step ${selectedSpecialty ? "completed" : "active"}`}>
          <span className="step-number">1</span>
          <span className="step-title">Especialidad</span>
        </div>

        <div
          className={`step ${
            selectedProfessional
              ? "completed"
              : selectedSpecialty
              ? "active"
              : ""
          }`}
        >
          <span className="step-number">2</span>
          <span className="step-title">Profesional</span>
        </div>

        <div
          className={`step ${
            selectedDate ? "completed" : selectedProfessional ? "active" : ""
          }`}
        >
          <span className="step-number">3</span>
          <span className="step-title">Fecha</span>
        </div>

        <div
          className={`step ${
            selectedTimeSlot ? "completed" : selectedDate ? "active" : ""
          }`}
        >
          <span className="step-number">4</span>
          <span className="step-title">Horario</span>
        </div>

        <div className={`step ${showConfirmation ? "active" : ""}`}>
          <span className="step-number">5</span>
          <span className="step-title">Confirmar</span>
        </div>
      </div>

      <div className="booking-content">
        {!selectedSpecialty && (
          <SpecialtySelector
            specialties={specialties}
            onSelect={handleSpecialtySelect}
          />
        )}

        {selectedSpecialty && !selectedProfessional && (
          <ProfessionalSelector
            profesionales={filteredProfessionals}
            onSelect={handleProfessionalSelect}
            onBack={() => setSelectedSpecialty(null)}
          />
        )}

        {selectedSpecialty && selectedProfessional && !selectedDate && (
          <CalendarView
            profesional={selectedProfessional}
            onDateSelect={handleDateSelect}
            onBack={() => setSelectedProfessional(null)}
          />
        )}

        {selectedSpecialty && selectedProfessional && selectedDate && !showConfirmation && (
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
