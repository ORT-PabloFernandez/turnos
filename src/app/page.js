"use client";
import Link from "next/link";
import {
  FaCalendarAlt,
  FaUserMd,
  FaClock,
  FaCalendarCheck,
} from "react-icons/fa";
import { useAuth } from "@/app/context/AuthContext";

export default function Home() {

  const { currentUser } = useAuth();


  const features = [
    {
      title: "Profesionales",
      description: "Gestiona profesionales y sus especialidades",
      icon: <FaUserMd size={48} />,
      href: "/profesionales",
      color: "#3b82f6",
    },
    currentUser && {
      title: "Reservar Turno",
      description: "Encuentra y reserva turnos disponibles",
      icon: <FaCalendarAlt size={48} />,
      href: "/turnos",
      color: "#10b981",
    },
    currentUser && {
      title: "Mis Turnos",
      description: "Consulta tus turnos reservados",
      icon: <FaCalendarCheck size={48} />,
      href: "/mis-turnos",
      color: "#f59e0b",
    },
    {
      title: "Horarios",
      description: "Administra horarios disponibles",
      icon: <FaClock size={48} />,
      href: "/horarios",
      color: "#ef4444",
    },
  ].filter(Boolean); // Filtra las características nulas si el usuario no está autenticado

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div
        style={{
          textAlign: "center",
          marginBottom: "3rem",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: "bold",
            color: "#333",
            marginBottom: "1rem",
          }}
        >
          Sistema de Turnos
        </h1>
        <p
          style={{
            fontSize: "1.25rem",
            color: "#666",
            marginBottom: "2rem",
          }}
        >
          Gestiona turnos de manera eficiente y sencilla
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2rem",
          marginTop: "2rem",
        }}
      >
        {features.map((feature, index) => (
          <Link
            key={index}
            href={feature.href}
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "12px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                textAlign: "center",
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "pointer",
                border: "1px solid #e5e7eb",
                minHeight: "220px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
              }}
            >
              <div style={{ color: feature.color, marginBottom: "1rem" }}>
                {feature.icon}
              </div>
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  color: "#333",
                  marginBottom: "0.5rem",
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  color: "#666",
                  fontSize: "1rem",
                }}
              >
                {feature.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
  
}
