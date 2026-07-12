import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WorkoutPage from './pages/WorkoutPage';

/**
 * Корневой компонент приложения с роутингом и контекстом авторизации.
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/workout/:id" element={<WorkoutPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;