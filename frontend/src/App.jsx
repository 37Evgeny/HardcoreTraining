import { Suspense, lazy } from 'react';
import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Ленивая загрузка страниц для code-splitting
const HomePage = lazy(() => import('./pages/HomePage/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage/RegisterPage'));
const WorkoutPage = lazy(() => import('./pages/WorkoutPage/WorkoutPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage/HistoryPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage/ProfilePage'));

/**
 * Компонент-обёртка для анимированных переходов между страницами.
 * При смене location добавляет класс анимации к контейнеру.
 */
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div className="page-enter" key={location.pathname}>
      <Suspense
        fallback={
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div className="spinner" />
          </div>
        }
      >
        <Routes location={location}>
          {/* Публичные маршруты */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Защищённые маршруты (только для авторизованных) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workout/:id"
            element={
              <ProtectedRoute>
                <WorkoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </div>
  );
}

/**
 * Корневой компонент приложения.
 * Оборачивает всё в провайдеры контекста и роутер.
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <Navbar />
          <main style={{ flex: 1, paddingTop: 'var(--navbar-height)' }}>
            <AnimatedRoutes />
          </main>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;