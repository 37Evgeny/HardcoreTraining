import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../../components/Loader/Loader';
import { getHistory } from '../../services/api';
import { getLevelLabel } from '../../utils/levels';

/**
 * HistoryPage — история завершённых тренировок с пагинацией.
 * ИСПРАВЛЕНО: getHistory возвращает { data, meta } через api.js.
 */
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
      .then((result) => {
        setSessions(result.data);
        setTotalPages(result.meta?.totalPages || 1);
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
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) return <Loader label="Загрузка истории..." />;

  if (error) {
    return (
      <div className="container error-container">
        <h2>😕 Ошибка</h2>
        <p>{error}</p>
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="container history-page">
      <header className="header">
        <h1>📋 История тренировок</h1>
        <p className="subtitle">Все завершённые тренировки</p>
      </header>

      {sessions.length === 0 ? (
        <div className="history-page__empty">
          <p className="history-page__empty-icon">🏋️</p>
          <h3>У вас пока нет завершённых тренировок</h3>
          <p>Начните первую тренировку прямо сейчас!</p>
          <Link to="/" className="btn btn-primary">🚀 К тренировкам</Link>
        </div>
      ) : (
        <>
          <div className="history-page__list">
            {sessions.map((session) => (
              <div key={session.id} className="card history-page__item">
                <div>
                  <h4>{session.workout?.title || 'Неизвестная тренировка'}</h4>
                  <div className="history-page__meta">
                    {session.workout?.level && (
                      <span className="history-page__badge">{getLevelLabel(session.workout.level)}</span>
                    )}
                    <span>🕐 {formatDate(session.createdAt)}</span>
                    {session.finishedAt && <span>✅ Завершена</span>}
                  </div>
                </div>
                <Link to={`/workout/${session.workoutId}`} className="btn btn-secondary">
                  Повторить
                </Link>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="history-page__pagination">
              <button type="button" className="btn btn-secondary" disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}>← Назад</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} type="button"
                  className={`btn ${page === p ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setPage(p)}>{p}</button>
              ))}
              <button type="button" className="btn btn-secondary" disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Вперед →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HistoryPage;