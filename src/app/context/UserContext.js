'use client';

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { FaSmile, FaSmileBeam, FaSmileWink, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '@/app/context/AuthContext';
const UserContext = createContext();

export const CatalogAvatars = [
    { key: "1", icon: <FaSmile size={48}/> },
    { key: "2", icon: <FaSmileBeam size={48}/> },
    { key: "3", icon: <FaSmileWink size={48}/> },
    { key: "default", icon: <FaUserCircle size={48}/> }
]

export const CatalogAvatars28 = [
    { key: "1", icon: <FaSmile size={28}/> },
    { key: "2", icon: <FaSmileBeam size={28}/> },
    { key: "3", icon: <FaSmileWink size={28}/> },
    { key: "default", icon: <FaUserCircle size={28}/> }
]

export const GetAvatar = (avatar, size) => {
    let avatarsToUse = [];
    if (size == 28) {
        avatarsToUse = CatalogAvatars28;
    } else {
        avatarsToUse = CatalogAvatars;
    }
    
    const foundAvatar = avatarsToUse.find(a => a.key === avatar);
    return foundAvatar ? foundAvatar.icon : avatarsToUse.find(a => a.key === "default").icon;
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { currentUser } = useAuth(); // si AuthProvider envuelve a UserProvider
  useEffect(() => {
    if (currentUser?.id) {
      fetchUser(currentUser.id);
    } else {
      const token = getToken();
      // opcional: decodificar token para obtener userId y fetchUser(userId)
    }
  }, [currentUser]);

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  };

  const fetchUser = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Error al cargar usuario');
      const data = await response.json();
      setUser(data);
      return data;
    } catch (err) {
      console.error('Error fetch user:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId, formData) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error('Error al guardar');
      setUser(formData);
      return true;
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      return false;
    }
  };

    const value = useMemo(() => ({
      user, loading, fetchUser, updateUser
    }), [user, loading]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe ser usado dentro de UserProvider');
  }
  return context;
};
