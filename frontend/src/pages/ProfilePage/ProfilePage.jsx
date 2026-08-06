import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// ИСПРАВЛЕНО: путь '../../context/AuthContext' (поднимаемся из pages/ProfilePage/ -> src/)
import Loader from '../../components/Loader/Loader';
import { useAuth } from '../../context/AuthContext';
import './ProfilePage.css';

/**
 * ProfilePage — страница профиля пользователя.
 * Отображает информацию о пользователе и историю тренировок.
 * @returns {JSX.Element}
 */
const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Загружает историю тренировок пользователя.
   */
  useEffect(() => {
    // Если пользователь не авторизован — перенаправляем на логин
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        // Используем API для получения истории
        const response = await fetch('/api/workouts/history', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Не удалось загрузить историю тренировок');
        }

        const data = await response.json();
        setHistory(data);
      } catch (err) {
        console.error('Ошибка загрузки истории:', err);
        setError('Не удалось загрузить историю тренировок.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, navigate]);

  /**
   * Обработчик выхода из аккаунта.
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Если пользователь не загружен — показываем лоадер
  if (!user) {
    return <Loader />;
  }

  return (
    <div className="profile-page">
      <h1 className="profile-page__title">Профиль</h1>

      <div className="profile-page__info">
        <h2>{user.name || 'Пользователь'}</h2>
        <p>Email: {user.email}</p>
        <p>Зарегистрирован: {new Date(user.createdAt).toLocaleDateString()}</p>
      </div>

      <div className="profile-page__history">
        <h2>История тренировок</h2>

        {loading ? (
          <Loader />
        ) : error ? (
          <p className="profile-page__error">{error}</p>
        ) : history.length === 0 ? (
          <p className="profile-page__empty">
            У вас пока нет завершённых тренировок.
          </p>
        ) : (
          <ul className="profile-page__history-list">
            {history.map((session) => (
              <li key={session.id} className="profile-page__history-item">
                <span>{session.workout?.name || 'Тренировка'}</span>
                <span>
                  {new Date(session.createdAt).toLocaleDateString()}
                </span>
                <span>
                  Длительность:{' '}
                  {session.duration
                    ? `${Math.round(session.duration / 60)} мин`
                    : '—'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="btn btn--danger profile-page__logout"
      >
        Выйти из аккаунта
      </button>
    </div>
  );
};

export default ProfilePage;