"use client";

import React, { useState } from "react";
import {
  FaBell,
  FaCheckCircle,
  FaInfoCircle,
  FaExclamationCircle,
} from "react-icons/fa";
// CORREGIDO: El archivo real es 'TurnosContext.js' (con mayúsculas), no 'turnos-context'
import { useTurnos } from "@/app/context/TurnosContext";
import "./navbar.css";

const Notifications = () => {
  // 1. IMPORTANTE: Traemos la función para marcar una sola como leída
  const { notifications, markAllNotificationsAsRead, markNotificationAsRead } =
    useTurnos();
  const [showDropdown, setShowDropdown] = useState(false);

  // Filtramos las no leídas
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMouseEnter = () => {
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    setShowDropdown(false);
  };

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
  };

  // 2. NUEVA FUNCIÓN: Maneja el click en una notificación individual
  const handleNotificationClick = (id) => {
    markNotificationAsRead(id);
  };

  // Icono según el tipo de notificación
  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <FaCheckCircle color="#10b981" />;
      case "error":
        return <FaExclamationCircle color="#ef4444" />;
      default:
        return <FaInfoCircle color="#3b82f6" />;
    }
  };

  return (
    <div
      className="notificationContainer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: "pointer" }}
    >
      <FaBell className="notificationIcon" />

      {/* Badge rojo solo si hay no leídas */}
      {unreadCount > 0 && <span className="notificationIndicator"></span>}

      {/* Menú Desplegable */}
      {showDropdown && (
        <div className="dropdownMenu notifications-dropdown-width">
          <div className="notifications-header">
            <span>Notificaciones</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="mark-read-btn">
                Marcar todas leídas
              </button>
            )}
          </div>

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">No tienes notificaciones</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  // 3. AQUÍ ESTÁ LA MAGIA: El evento onClick en el ítem
                  onClick={() => handleNotificationClick(notif.id)}
                  className={`notification-item ${
                    !notif.read ? "bg-unread" : ""
                  }`}
                  // Agregamos cursor pointer y title para mejorar la UX
                  style={{ cursor: "pointer" }}
                  title="Haz click para marcar como leída"
                >
                  <div className="notif-icon">{getIcon(notif.type)}</div>
                  <div className="notif-content">
                    <p className="notif-title">{notif.title}</p>
                    <p className="notif-message">{notif.message}</p>
                    <span className="notif-date">
                      {new Date(notif.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Opcional: Un puntito visual extra para las no leídas */}
                  {!notif.read && (
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#3b82f6",
                        marginLeft: "8px",
                        flexShrink: 0,
                      }}
                    ></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
