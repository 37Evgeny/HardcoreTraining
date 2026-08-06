import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/api';

/**
 * AuthContext — глобальное состояние аутентификации.
 * Предоставляет: user, login, register, logout, isLoading.
 */
const AuthContext = createContext(null);

/**
 * Хук доступа к контексту.
 * Бросает ошибку, если используется вне AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Восстановление сессии из localStorage при монтировании.
   * Если данные повреждены — очищаем всё.
   */
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        // Повреждённые данные — полная очистка
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  /**
   * Логин. api.js возвращает { accessToken, refreshToken, user }.
   */
  const login = useCallback(async (email, password) => {
    const userData = await apiLogin({ email, password });
    localStorage.setItem('accessToken', userData.accessToken);
    localStorage.setItem('refreshToken', userData.refreshToken);
    localStorage.setItem('user', JSON.stringify(userData.user));
    setUser(userData.user);
    return userData.user;
  }, []);

  /**
   * Регистрация.
   */
  const register = useCallback(async (email, password, name) => {
    const userData = await apiRegister({ email, password, name });
    localStorage.setItem('accessToken', userData.accessToken);
    localStorage.setItem('refreshToken', userData.refreshToken);
    localStorage.setItem('user', JSON.stringify(userData.user));
    setUser(userData.user);
    return userData.user;
  }, []);

  /**
   * Выход: очистка всех данных.
   */
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};