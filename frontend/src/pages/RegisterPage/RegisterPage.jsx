import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// ИСПРАВЛЕНО: путь '../../context/AuthContext' (поднимаемся из pages/RegisterPage/ -> src/)
import { useAuth } from '../../context/AuthContext';
import './RegisterPage.css';

/**
 * RegisterPage — страница регистрации нового пользователя.
 * @returns {JSX.Element}
 */
const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * Валидирует форму перед отправкой.
   * @returns {string|null} — сообщение об ошибке или null
   */
  const validateForm = () => {
    const { email, password, confirmPassword, name } = formData;

    if (!name.trim()) return 'Имя обязательно для заполнения';
    if (!email.trim()) return 'Email обязателен для заполнения';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Некорректный формат email';
    if (!password) return 'Пароль обязателен для заполнения';
    if (password.length < 8) return 'Пароль должен содержать минимум 8 символов';
    if (password !== confirmPassword) return 'Пароли не совпадают';

    return null;
  };

  /**
   * Обработчик изменения полей формы.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Сбрасываем ошибку при изменении поля
    if (error) setError(null);
  };

  /**
   * Обработчик отправки формы регистрации.
   * @param {React.FormEvent<HTMLFormElement>} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await register(
        formData.email,
        formData.password,
        formData.name
      );

      // После успешной регистрации перенаправляем на главную
      navigate('/');
    } catch (err) {
      console.error('Ошибка регистрации:', err);
      setError(
        err.response?.data?.message ||
          'Не удалось зарегистрироваться. Попробуйте позже.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <h1 className="register-page__title">Регистрация</h1>

      <form onSubmit={handleSubmit} className="register-page__form" noValidate>
        {error && (
          <div className="register-page__error" role="alert">
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="name">Имя</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ваше имя"
            required
            autoComplete="name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@mail.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Пароль</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Минимум 8 символов"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Подтвердите пароль</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Повторите пароль"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          className="btn btn--primary register-page__submit"
          disabled={loading}
        >
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>

        <p className="register-page__login-link">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;