// src/components/Auth/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useIsAuthenticated, useAuth } from '../../hooks/redux';
import { selectIsInitialized } from '../../store/slices/authSlice';
import { useAppSelector } from '../../hooks/redux';
import LoadingSpinner from '../UI/LoadingSpinner';

/**
 * ProtectedRoute Component
 * 
 * Industry Practice: Route protection with authentication checks
 * 
 * Features:
 * - Redirects unauthenticated users to login
 * - Preserves intended destination for post-login redirect
 * - Shows loading state during auth check
 * - Handles email confirmation flow
 */
const ProtectedRoute = ({ children, requireEmailConfirmation = true }) => {
  const isAuthenticated = useIsAuthenticated();
  const { needsEmailConfirmation, isLoading } = useAuth();
  const isInitialized = useAppSelector(selectIsInitialized);
  const location = useLocation();

  // Show loading spinner while checking authentication or if not initialized
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Handle email confirmation requirement
  if (requireEmailConfirmation && needsEmailConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
              <svg
                className="h-6 w-6 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Email Confirmation Required
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please check your email and click the confirmation link to continue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              I've confirmed my email
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render protected content
  return children;
};

export default ProtectedRoute;
