import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader/Loader';
import { useAuth } from '../../context/AuthContext';
import { getHistory } from '../../services/api';
import './ProfilePage.css';

/**
 * ProfilePage — профиль пользователя и история тренировок.
 */
const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Загрузка истории.
   * ИСПРАВЛЕНО: используем api.js (автоподстановка токена) вместо raw fetch
   * и неправильного ключа localStorage 'token'.
   */
  useEffect(() => {
    if (!user) { navigate('/login'); return; }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        // getHistory возвращает { data, meta } через api.js
        const result = await getHistory({ page: 1, limit: 20 });
        setHistory(result.data);
      } catch (err) {
        console.error('Ошибка загрузки истории:', err);
        setError('Не удалось загрузить историю тренировок.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return <Loader />;

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
          <p className="profile-page__empty">У вас пока нет завершённых тренировок.</p>
        ) : (
          <ul className="profile-page__history-list">
            {history.map((session) => (
              <li key={session.id} className="profile-page__history-item">
                {/* ИСПРАВЛЕНО: бэкенд возвращает workout.title */}
                <span>{session.workout?.title || 'Тренировка'}</span>
                <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                <span>Длительность: {session.duration ? `${Math.round(session.duration / 60)} мин` : '—'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button type="button" onClick={handleLogout} className="btn btn--danger profile-page__logout">
        Выйти из аккаунта
      </button>
    </div>
  );
};

export default ProfilePage;