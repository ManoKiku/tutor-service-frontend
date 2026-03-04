'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { RegisterRequest } from '@/types/auth';
import Link from 'next/link';
import './register.css';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 0,
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string>('');

  if (isAuthenticated) {
    router.push('/');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'radio') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value, 10),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.phone) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    if (formData.password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Пожалуйста, введите корректный email адрес');
      return;
    }

    const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Пожалуйста, введите корректный номер телефона');
      return;
    }

    try {
      await register(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации. Попробуйте еще раз.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <h2>Регистрация на Repetitor.by</h2>
          <p>Создайте аккаунт для доступа ко всем возможностям платформы</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                Имя
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="form-input"
                placeholder="Введите ваше имя"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                Фамилия
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="form-input"
                placeholder="Введите вашу фамилию"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="example@mail.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Телефон
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-input"
              placeholder="+375 (XX) XXX-XX-XX"
              required
            />
            <small className="form-hint">
              Формат: +375 (XX) XXX-XX-XX
            </small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Пароль
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Минимум 6 символов"
                minLength={6}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Подтверждение пароля
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                placeholder="Повторите пароль"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Вы регистрируетесь как:</label>
            <div className="role-selector">
              <label className={`role-option ${formData.role === 0 ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="0"
                  checked={formData.role === 0}
                  onChange={handleChange}
                  className="role-radio"
                />
                <div className="role-content">
                  <span className="role-title">Ученик</span>
                  <span className="role-description">
                    Ищу репетитора для помощи в обучении
                  </span>
                </div>
              </label>

              <label className={`role-option ${formData.role === 1 ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="1"
                  checked={formData.role === 1}
                  onChange={handleChange}
                  className="role-radio"
                />
                <div className="role-content">
                  <span className="role-title">Репетитор</span>
                  <span className="role-description">
                    Преподаю и помогаю ученикам
                  </span>
                </div>
              </label>
            </div>
            {formData.role === 1 && (
              <div className="tutor-note">
                <span>
                  После регистрации вас перенаправит на страницу заполнения профиля репетитора
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={isLoading}
          >
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="auth-links">
          <p className="auth-link-text">
            Уже есть аккаунт?{' '}
            <Link href="/login" className="auth-link">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}