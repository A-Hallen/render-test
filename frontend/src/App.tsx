import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Analysis } from './pages/Analysis';
import { AIChat } from './pages/AIChat';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Loans } from './pages/Loans';
import { Members } from './pages/Members';
import { Deposits } from './pages/Deposits';
import { Visualizacion3D } from './pages/Visualizacion3D';
import { Sincronizacion } from './pages/Sincronizacion';
import { IndicadoresContables } from './pages/IndicadoresContables';
import Profile from './pages/Profile';
import { NotificationsTest } from './pages/NotificationsTest';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import { Login } from './pages/Login';
import { VerifyEmail } from './pages/VerifyEmail';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <DataProvider>
            <Toaster position="top-right" toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#333',
              },
            }} />
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/analysis" element={<Analysis />} />
                  <Route path="/ai-chat" element={<AIChat />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/loans" element={<Loans />} />
                  <Route path="/members" element={<Members />} />
                  <Route path="/deposits" element={<Deposits />} />
                  <Route path="/visualizacion-3d" element={<Visualizacion3D />} />
                  <Route path="/sincronizacion" element={<Sincronizacion />} />
                  <Route path="/indicadores-contables" element={<IndicadoresContables />} />
                  <Route path="/settings/*" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/notifications-test" element={<NotificationsTest />} />
                </Route>
              </Routes>
            </Router>
          </DataProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;