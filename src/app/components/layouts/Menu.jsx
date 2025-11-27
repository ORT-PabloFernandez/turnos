'use client';

import React from 'react';
import Link from 'next/link';
import { FaCalendarAlt, FaUserMd, FaClock, FaCalendarCheck } from 'react-icons/fa';
import { usePathname } from 'next/navigation';
import { useAuth } from "../../context/AuthContext";

const Menu = () => {

  const { currentUser } = useAuth();

  const navLinks = [
    { name: 'Profesionales', path: '/profesionales', icon: <FaUserMd className="navIcon" /> },
    currentUser && { name: 'Reservar Turno', path: '/turnos', icon: <FaCalendarAlt className="navIcon" /> },
    currentUser && { name: 'Mis Turnos', path: '/mis-turnos', icon: <FaCalendarCheck className="navIcon" /> },
    { name: 'Horarios', path: '/horarios', icon: <FaClock className="navIcon" /> },
  ].filter(Boolean); // Filtra los enlaces nulos si el usuario no está autenticado

  const pathname = usePathname();

  return (
    <div className="desktopNavLinks">
      {navLinks.map((link) => (
        <Link
          key={link.path}
          href={link.path}
          className={`navLink ${pathname === link.path ? 'activeLink' : 'inactiveLink'}`}
        >
          {link.icon}   
          {link.name}
        </Link>
      ))}
    </div>
  );
};

export default Menu;