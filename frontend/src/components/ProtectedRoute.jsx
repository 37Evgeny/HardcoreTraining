import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Компонент-обёртка для защиты маршрутов.
 * Если пользователь не авторизован — перенаправляет на /login.
 */
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Пока проверяем авторизацию — показываем заглушку
  if (isLoading) {
    return (
      <div className="container loading-container">
        <div className="spinner"></div>
        <p>Проверка авторизации...</p>
      </div>
    );
  }

  // Если не авторизован — редирект на логин с сохранением исходного URL
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;