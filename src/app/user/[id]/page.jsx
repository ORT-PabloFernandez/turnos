'use client';

import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaEdit, FaSave, FaUserCircle } from 'react-icons/fa';
import { useParams } from "next/navigation";
import Link from 'next/link';
import { useUser, GetAvatar, CatalogAvatars } from '@/app/context/UserContext';
import './user.css';

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const params = useParams();
  const userId = params.id;
  const { user, loading, fetchUser, updateUser } = useUser();

  useEffect(() => {
    if (userId) {
      fetchUser(userId);
    }
  }, [userId]);

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (avatarKey) => {
    setFormData(prev => ({
      ...prev,
      avatar: avatarKey
    }));
  };

  const handleSave = async () => {
    const success = await updateUser(userId, formData);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
  };

  if (loading) return <div className="user-profile-loading">Cargando...</div>;
  if (!user) return <div className="user-profile-error">Usuario no encontrado</div>;

  return (
    <div className="user-profile-container">
      <Link href="/" className="back-button">
        <FaArrowLeft /> Volver
      </Link>

      <div className="profile-header">
        <div className="profile-avatar">
          {formData.avatar ? (
            GetAvatar(formData.avatar, 80)
          ) : (
            <FaUserCircle size={80}/>
          )}
        </div>
        <div className="profile-info">
          <h1>{formData.name} {formData.apellido}</h1>
          <p className="profile-email">{formData.email}</p>
        </div>
        <button
          className="edit-button"
          onClick={() => setIsEditing(!isEditing)}
        >
          <FaEdit /> {isEditing ? 'Cancelar' : 'Editar'}
        </button>
      </div>

      {isEditing ? (
        <div className="edit-form">
          <div className="form-group">
            <label>Avatar</label>
            <div className="avatar-selector">
              {CatalogAvatars.map((avatar) => (
                <div
                  key={avatar.key}
                  className={`avatar-option ${formData.avatar === avatar.key ? 'selected' : ''}`}
                  onClick={() => handleAvatarChange(avatar.key)}
                >
                  {GetAvatar(avatar.key, 48)}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Nombre de Usuario</label>
            <input
              type="text"
              name="username"
              value={formData.username || ''}
              disabled
            />
          </div>
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Apellido</label>
            <input
              type="text"
              name="apellido"
              value={formData.apellido || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              disabled
            />
          </div>
          <div className="form-group">
            <label>Fecha de Nacimiento</label>
            <input
              type="date"
              name="fechaNacimiento"
              value={formData.fechaNacimiento || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-buttons">
            <button className="save-button" onClick={handleSave}>
              <FaSave /> Guardar cambios
            </button>
            <button className="cancel-button" onClick={handleCancel}>
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="profile-details">
          <div className="detail-item">
            <strong>Nombre de Usuario:</strong>
            <span>{user.username}</span>
          </div>
          <div className="detail-item">
            <strong>Nombre:</strong>
            <span>{user.nombre}</span>
          </div>
          <div className="detail-item">
            <strong>Apellido:</strong>
            <span>{user.apellido}</span>
          </div>
          <div className="detail-item">
            <strong>Email:</strong>
            <span>{user.email}</span>
          </div>
          <div className="detail-item">
            <strong>Fecha de Nacimiento:</strong>
            <span>{user.fechaNacimiento}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;