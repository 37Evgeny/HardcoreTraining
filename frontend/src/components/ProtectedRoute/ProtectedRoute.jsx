import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../Loader/Loader';

/**
 * ProtectedRoute — защита приватных маршрутов.
 * @param {React.ReactNode} children - защищаемый контент
 */
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Пока проверяем авторизацию — показываем Loader (переиспользуем)
  if (isLoading) {
    return <Loader label="Проверка авторизации..." />;
  }

  // Не авторизован — редирект на логин с сохранением исходного URL
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ?? null;
};

export default ProtectedRoute;