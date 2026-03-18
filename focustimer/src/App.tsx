import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import TimerPage from './modules/timer/TimerPage';
import SettingsForm from './modules/settings/SettingsForm';
import { useNotification } from './hooks/useNotification';
import { useDocumentTitle } from './hooks/useDocumentTitle';
import { useSettingsStore } from './stores/settingsStore';
import { applyTheme } from './utils/themes';

function AppContent() {
  useNotification();
  useDocumentTitle();
  const theme = useSettingsStore((s) => s.theme);

  // Apply theme on mount and when it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<TimerPage />} />
        <Route path="/settings" element={<SettingsForm />} />
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
