'use client';

import { useState, useEffect } from 'react';
//import { useAuth } from '../../../auth/AuthProvider';
import styles from './navbar.css';

// Importar los componentes modulares
import Logo from './Logo';
import Menu from './Menu';
import Notifications from './Notifications';
import CurrentUser from './CurrentUser';

export default function Navbar() {
  // TODO: Obtener el usuario del local storage una vez hecho el login

  
    const { currentUser, logout } = {currentUser: {
    id: '15',
    name: 'Grady Archie',
    avatar: 'https://raw.githubusercontent.com/ORT-PabloFernandez/PNTP2-REACT-EJEMPLO/main/public/img/Grady%20Archie.jpg',
    email: 'Grady.Archie@ejemplo.com',
    status: 'completed'
  }, logout: () => {}};

  useEffect(() => {
    // Deja un objeto compatible con el TurnosContext en localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationIndicator, setNotificationIndicator] = useState(true);

  if (!currentUser) return null;

  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* Logo and Menu */}
        <div className="navbar-left">
          <Logo />
          <Menu />
        </div>

        {/* User Menu */}
        <div className="navbar-right">
          <Notifications notificationIndicator={notificationIndicator} />
          <CurrentUser currentUser={currentUser} logout={logout} />
        </div>
      </div>
    </nav>
  );
}