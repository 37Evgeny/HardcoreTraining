// frontend/src/pages/HistoryPage.jsx
// Страница истории завершённых тренировок пользователя.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getHistory } from '../services/api';

const HistoryPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError(null);

    getHistory({ page, limit: 20 })
      .then((res) => {
        if (res.data.success) {
          setSessions(res.data.data);
          // ✅ Исправлено: API возвращает meta, а не pagination
          setTotalPages(res.data.meta?.totalPages || 1);
        } else {
          setError('Ошибка загрузки истории');
        }
      })
      .catch((err) => {
        console.error('Ошибка загрузки истории:', err);
        setError('Не удалось загрузить историю тренировок.');
      })
      .finally(() => setLoading(false));
  }, [page]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLevelBadge = (level) => {
    const colors = {
      BEGINNER: { bg: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71' },
      INTERMEDIATE: { bg: 'rgba(241, 196, 15, 0.15)', color: '#f1c40f' },
      ADVANCED: { bg: 'rgba(231, 76, 60, 0.15)', color: '#e74c3c' },
    };
    const style = colors[level] || colors.BEGINNER;
    return (
      <span style={{
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        background: style.bg,
        color: style.color,
      }}>
        {level === 'BEGINNER' ? 'Начальный' : level === 'INTERMEDIATE' ? 'Средний' : 'Продвинутый'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container loading-container">
        <div className="spinner"></div>
        <p>Загрузка истории...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container error-container">
        <h2>😕 Ошибка</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <header className="header">
        <h1>📋 История тренировок</h1>
        <p className="subtitle">Все завершённые тренировки</p>
      </header>

      {sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ fontSize: '3rem', marginBottom: '16px' }}>🏋️</p>
          <h3 style={{ marginBottom: '12px' }}>У вас пока нет завершённых тренировок</h3>
          <p style={{ color: 'var(--text-tertiary)', marginBottom: '24px' }}>
            Начните первую тренировку прямо сейчас!
          </p>
          <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            🚀 К тренировкам
          </Link>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sessions.map((session) => (
              <div
                key={session.id}
                className="card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 20px',
                }}
              >
                <div>
                  <h4 style={{ marginBottom: '4px' }}>{session.workout?.title || 'Неизвестная тренировка'}</h4>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {session.workout?.level && getLevelBadge(session.workout.level)}
                    <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
                      🕐 {formatDate(session.createdAt)}
                    </span>
                    {session.finishedAt && (
                      <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
                        ✅ Завершена
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link
                    to={`/workout/${session.workoutId}`}
                    className="btn btn-secondary"
                    style={{ textDecoration: 'none', fontSize: 'var(--text-sm)' }}
                  >
                    Повторить
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Пагинация */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '30px',
              marginBottom: '40px',
            }}>
              <button
                className="btn btn-secondary"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                ← Назад
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`btn ${page === p ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setPage(p)}
                  style={{ minWidth: '40px' }}
                >
                  {p}
                </button>
              ))}
              <button
                className="btn btn-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Вперед →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HistoryPage;