'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { updateUserProfile, changePassword, uploadAvatar, deleteAvatar, getUserAvatarUrl } from '@/services/users';
import { clearAuthData, saveAuthData, getAuthData } from '@/lib/auth';
import { FaUser, FaCamera, FaTrash, FaSave, FaKey } from 'react-icons/fa';
import './profile.css';

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
    }
  }, [user]);
  
  useEffect(() => {
    if (user?.id) {
      const loadAvatar = async () => {
        setIsLoadingAvatar(true);
        try {
          const url = await getUserAvatarUrl(user.id);
          setAvatarUrl(url);
        } catch (error) {
          console.error('Error loading avatar:', error);
        } finally {
          setIsLoadingAvatar(false);
        }
      };
      loadAvatar();
    }
  }, [user?.id]);
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsUpdatingProfile(true);
    try {
      const updatedUser = await updateUserProfile({ firstName, lastName, phone });
      
      const { token } = getAuthData(false);
       const refreshToken = localStorage.getItem('refreshToken');
       const tokenExpiration = localStorage.getItem('token_expiration');

      if (token && refreshToken && tokenExpiration) {
        clearAuthData();
        saveAuthData(refreshToken, token, new Date(tokenExpiration), updatedUser);
      }
      alert('Профиль успешно обновлён');
      window.location.reload();
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Ошибка при обновлении профиля');
    } finally {
      setIsUpdatingProfile(false);
    }
  };
  
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }
    if (newPassword.length < 6) {
      alert('Новый пароль должен содержать минимум 6 символов');
      return;
    }
    
    setIsChangingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      alert('Пароль успешно изменён');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Ошибка при смене пароля');
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Можно загружать только изображения');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5 МБ');
      return;
    }
    
    setIsUploadingAvatar(true);
    try {
      await uploadAvatar(user.id, file);
      const newUrl = await getUserAvatarUrl(user.id);
      if (avatarUrl?.startsWith('blob:')) URL.revokeObjectURL(avatarUrl);
      user.avatarUrl = `/api/users/${user.id}/avatar`;
      localStorage.setItem('user', JSON.stringify(user));
      setAvatarUrl(newUrl);
      alert('Аватар загружен');
      window.location.reload();
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Ошибка загрузки аватара');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  
  const handleDeleteAvatar = async () => {
    if (!user) return;
    if (!confirm('Вы уверены, что хотите удалить аватар?')) return;
    
    try {
      await deleteAvatar(user.id);
      if (avatarUrl?.startsWith('blob:')) URL.revokeObjectURL(avatarUrl);
      setAvatarUrl(null);
      alert('Аватар удалён');
      user.avatarUrl = null;
      localStorage.setItem('user', JSON.stringify(user));
      window.location.reload();
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Ошибка удаления аватара');
    }
  };
  
  if (authLoading) {
    return (
      <div className="main-content">
        <div className="loading">Загрузка...</div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="main-content">
        <div className="card">
          <h2>Доступ запрещён</h2>
          <p>Пожалуйста, войдите в систему.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="main-content">
      <h1>Личный профиль</h1>
      
      <div className="profile-grid">
        <div className="profile-card avatar-card">
          <div className="avatar-container">
            {isLoadingAvatar ? (
              <div className="avatar-placeholder">
                <div className="loading-spinner"></div>
              </div>
            ) : avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="user-avatar-image" />
            ) : (
              <div className="avatar-placeholder">
                <FaUser />
              </div>
            )}
          </div>
          <div className="avatar-actions">
            <button 
              className="btn btn-secondary btn-small"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
            >
              <FaCamera /> {isUploadingAvatar ? 'Загрузка...' : 'Загрузить'}
            </button>
            {avatarUrl && (
              <button 
                className="btn btn-danger btn-small"
                onClick={handleDeleteAvatar}
              >
                <FaTrash /> Удалить
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
        </div>
        
        <div className="profile-card">
          <h2><FaUser /> Личные данные</h2>
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label>Имя</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Фамилия</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Телефон</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={isUpdatingProfile}>
                <FaSave /> {isUpdatingProfile ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="profile-card">
          <h2><FaKey /> Смена пароля</h2>
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label>Текущий пароль</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Новый пароль</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Подтверждение пароля</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={isChangingPassword}>
                <FaSave /> {isChangingPassword ? 'Изменение...' : 'Изменить пароль'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}