import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Analysis } from './pages/Analysis';
import { AIChat } from './pages/AIChat';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Loans } from './pages/Loans';
import { Members } from './pages/Members';
import { Deposits } from './pages/Deposits';
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
                  <Route path="/settings" element={<Settings />} />
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