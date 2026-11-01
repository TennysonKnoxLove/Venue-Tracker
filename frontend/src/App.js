import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import layout components
import MainLayout from './components/layout/MainLayout';

// Import auth components
import LoginForm from './pages/auth/LoginForm';
import RegisterForm from './pages/auth/RegisterForm';
import PasswordResetRequest from './pages/auth/PasswordResetRequest';
import PasswordResetVerify from './pages/auth/PasswordResetVerify';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './pages/auth/ProtectedRoute';

// Import pages
import HomePage from './pages/home/HomePage';
import VenuesPage from './pages/venues/VenuesPage';
import VenueDiscoveryPage from './pages/venuediscovery/VenueDiscoveryPage';
import AudioEditorPage from './pages/audio/AudioEditor';
import RemindersPage from './pages/reminders/RemindersPage';
import NetworkingPage from './pages/networking/NetworkingPage';
import NetworkPage from './pages/networking/NetworkPage';
import ProfilePage from './pages/profile/ProfilePage';
import EmailGeneratorPage from './pages/emailgen/EmailGeneratorPage';
import ChatPage from './pages/chat/ChatPage';
import ChatRoom from './pages/chatroom/ChatRoom';
import BudgetPage from './pages/budget/BudgetPage';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/password-reset" element={<PasswordResetRequest />} />
          <Route path="/password-reset/verify" element={<PasswordResetVerify />} />
          
          {/* Protected routes with layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/venues/*" element={<VenuesPage />} />
              <Route path="/search" element={<VenueDiscoveryPage />} />
              <Route path="/audio" element={<AudioEditorPage />} />
              <Route path="/reminders/*" element={<RemindersPage />} />
              <Route path="/network/*" element={<NetworkPage />} />
              <Route path="/networking/*" element={<NetworkingPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/email" element={<EmailGeneratorPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/chat/:roomId" element={<ChatRoom />} />
              <Route path="/budget" element={<BudgetPage />} />
            </Route>
          </Route>
          
          {/* Redirect all other routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App; 