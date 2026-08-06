import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * LoginPage — страница входа.
 * Логика корректна: login() из AuthContext возвращает данные,
 * api.js уже разворачивает ответ.
 */
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка входа. Проверьте email и пароль.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container login-page">
      <div className="card login-page__card">
        <h2 className="login-page__title">🔐 Вход</h2>
        <p className="login-page__subtitle">Войдите в свой аккаунт</p>

        {error && (
          <div className="login-page__error" role="alert">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="login-page__form" noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-primary login-page__submit" disabled={isSubmitting}>
            {isSubmitting ? 'Вход...' : '🚀 Войти'}
          </button>
        </form>

        <p className="login-page__register-link">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;