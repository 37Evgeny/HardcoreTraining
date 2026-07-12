import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/api';

/**
 * Контекст аутентификации.
 * Предоставляет: user, login, register, logout, isLoading.
 */
const AuthContext = createContext(null);

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
   * При монтировании проверяем, есть ли сохранённый токен.
   * Если есть — пробуем загрузить данные пользователя.
   */
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch {
        // Если данные повреждены — очищаем
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  /**
   * Логин: отправляем запрос на бэкенд, сохраняем токены и пользователя.
   */
  const login = useCallback(async (email, password) => {
    const response = await apiLogin({ email, password });
    const { accessToken, refreshToken, user: userData } = response.data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));

    setUser(userData);
    return userData;
  }, []);

  /**
   * Регистрация: отправляем запрос на бэкенд, сохраняем токены и пользователя.
   */
  const register = useCallback(async (email, password, name) => {
    const response = await apiRegister({ email, password, name });
    const { accessToken, refreshToken, user: userData } = response.data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));

    setUser(userData);
    return userData;
  }, []);

  /**
   * Логаут: очищаем все данные и токены.
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