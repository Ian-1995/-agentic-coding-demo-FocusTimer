import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import TimerPage from './modules/timer/TimerPage';
import SettingsForm from './modules/settings/SettingsForm';
import LoginPage from './modules/auth/LoginPage';
import RegisterPage from './modules/auth/RegisterPage';
import TasksPage from './modules/tasks/TasksPage';
import StatsPage from './modules/stats/StatsPage';
import { useNotification } from './hooks/useNotification';
import { useAuthStore } from './stores/authStore';
import { syncLocalSessions } from './services/syncService';

function AppContent() {
  useNotification();
  const initialize = useAuthStore((s) => s.initialize);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Sync local sessions when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      syncLocalSessions();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-[var(--color-text-muted)]">
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<TimerPage />} />
        <Route path="/settings" element={<SettingsForm />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
