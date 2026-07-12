import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Страница профиля пользователя.
 * Отображает информацию о пользователе и позволяет выйти из аккаунта.
 */
const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="container loading-container">
        <p>Загрузка профиля...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '500px', marginTop: '60px' }}>
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'var(--accent-red-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          margin: '0 auto 20px',
        }}>
          👤
        </div>

        <h2 style={{ marginBottom: '8px' }}>{user.name || 'Пользователь'}</h2>
        <p style={{ color: 'var(--text-tertiary)', marginBottom: '24px' }}>{user.email}</p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          textAlign: 'left',
          marginBottom: '30px',
        }}>
          <div style={{
            padding: '12px 16px',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <span style={{ color: 'var(--text-tertiary)' }}>Роль</span>
            <span style={{ fontWeight: 600 }}>
              {user.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
            </span>
          </div>
          <div style={{
            padding: '12px 16px',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <span style={{ color: 'var(--text-tertiary)' }}>Дата регистрации</span>
            <span style={{ fontWeight: 600 }}>
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString('ru-RU')
                : '—'
              }
            </span>
          </div>
        </div>

        {!showConfirm ? (
          <button
            className="btn btn-secondary"
            onClick={() => setShowConfirm(true)}
            style={{ width: '100%', color: 'var(--accent-red)' }}
          >
            🚪 Выйти из аккаунта
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowConfirm(false)}
              style={{ flex: 1 }}
            >
              Отмена
            </button>
            <button
              className="btn btn-primary"
              onClick={handleLogout}
              style={{ flex: 1, background: 'var(--accent-red)' }}
            >
              ✅ Выйти
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;