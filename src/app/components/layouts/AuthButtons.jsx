'use client';

import React from 'react';
import Link from 'next/link';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';

const AuthButtons = () => {
  return (
    <div className="auth-buttons">
      <Link href="/login" className="auth-nav-button login-button">
        Iniciar Sesión
      </Link>
      <Link href="/register" className="auth-nav-button register-button">
        Registrarse
      </Link>
    </div>
  );
};

export default AuthButtons;
