// src/App.jsx
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { getCurrentUser, clearError } from './store/slices/authSlice';
import { loadInterviewHistory } from './store/slices/interviewSlice';
import { selectIsInitialized } from './store/slices/authSlice';

// Components (we'll create these next)
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Dashboard from './pages/Dashboard/Dashboard';
import InterviewSetup from './pages/Interview/InterviewSetup';
import InterviewSession from './pages/Interview/InterviewSession';
import InterviewHistory from './pages/Interview/InterviewHistory';
import Profile from './pages/Profile/Profile';
import LoadingSpinner from './components/UI/LoadingSpinner';
import ApiTest from './components/Test/ApiTest';
import SpeechTest from './pages/Test/SpeechTest';
import SpeechToTextTest from './pages/Test/SpeechToTextTest';
import PasswordResetTest from './pages/Test/PasswordResetTest';
import { SpeechRecognitionProvider } from './components/Providers/SpeechRecognitionProvider';

// Industry Practice: App initialization component
function AppInitializer({ children }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const isInitialized = useAppSelector(selectIsInitialized);

  useEffect(() => {
    // Clear any existing auth errors on app initialization
    dispatch(clearError());
    
    // Check if user is already authenticated on app load
    const checkAuth = async () => {
      try {
        await dispatch(getCurrentUser());
      } catch (error) {
        // If getCurrentUser fails, still mark as initialized
        console.warn('Auth check failed:', error);
      }
    };
    
    checkAuth();
    
    // Fallback timeout to ensure app doesn't get stuck in loading
    const timeout = setTimeout(() => {
      if (!isInitialized) {
        console.warn('Auth check timeout, proceeding with unauthenticated state');
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(timeout);
  }, [dispatch, isInitialized]);

  useEffect(() => {
    // Load interview history when user is authenticated
    if (isAuthenticated) {
      dispatch(loadInterviewHistory());
    }
  }, [isAuthenticated, dispatch]);

  // Show loading spinner while checking authentication or if not initialized
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 w-full">
        <div className="text-center">
          <LoadingSpinner size="large" showText={true} text="Loading..." />
        </div>
      </div>
    );
  }

  return children;
}

// Industry Practice: Main App component with routing
function AppContent() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 w-full">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
            }
          />
          <Route
            path="/signup"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />
            }
          />
          <Route
            path="/forgot-password"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPassword />
            }
          />
          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="interview/setup" element={<InterviewSetup />} />
            <Route path="interview/session" element={<InterviewSession />} />
            <Route path="interview/history" element={<InterviewHistory />} />
            <Route path="profile" element={<Profile />} />
            <Route path="test" element={<ApiTest />} />
            <Route path="speech-test" element={<SpeechTest />} />
            <Route path="speech-to-text-test" element={<SpeechToTextTest />} />
            <Route path="password-reset-test" element={<PasswordResetTest />} />
          </Route>

          {/* Catch all route */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600 mb-8">Page not found</p>
                  <Navigate to="/dashboard" replace />
                </div>
      </div>
            }
          />
        </Routes>

        {/* Global toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

// Industry Practice: Root App component with Redux Provider
function App() {
  return (
    <Provider store={store}>
      <SpeechRecognitionProvider>
        <AppInitializer>
          <AppContent />
        </AppInitializer>
      </SpeechRecognitionProvider>
    </Provider>
  );
}

export default App;
