import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Analysis } from './pages/Analysis';
import { AIChat } from './pages/AIChat';
import { AsistenteIAPage } from './pages/AsistenteIA';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Loans } from './pages/Loans';
import { Members } from './pages/Members';
import { Deposits } from './pages/Deposits';
import { Visualizacion3D } from './pages/Visualizacion3D';
import { Sincronizacion } from './pages/Sincronizacion';
import { IndicadoresContables } from './pages/IndicadoresContables';
import { AuthProvider } from './context/AuthContext';
import { AutorizacionProvider } from './context/AutorizacionContext';
import { NotificationProvider } from './context/NotificationContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AccesoDenegado } from './pages/AccesoDenegado';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AutorizacionProvider>
          <NotificationProvider>
            <DataProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/acceso-denegado" element={<AccesoDenegado />} />
                <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/analysis" element={<Analysis />} />
                  <Route path="/ai-chat" element={<AIChat />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/loans" element={<Loans />} />
                  <Route path="/members" element={<Members />} />
                  <Route path="/deposits" element={<Deposits />} />
                  <Route path="/visualizacion-3d" element={<Visualizacion3D />} />
                  <Route path="/asistente-ia" element={<AsistenteIAPage />} />
                  <Route path="/sincronizacion" element={<Sincronizacion />} />
                  <Route path="/indicadores-contables" element={<IndicadoresContables />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Routes>
            </Router>
            </DataProvider>
          </NotificationProvider>
        </AutorizacionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;