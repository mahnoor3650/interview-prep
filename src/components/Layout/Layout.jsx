// src/components/Layout/Layout.jsx
import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useUser, useUI } from '../../hooks/redux';
import { logoutUser } from '../../store/slices/authSlice';
import { toggleSidebar, setCurrentPage } from '../../store/slices/uiSlice';
import LoadingSpinner from '../UI/LoadingSpinner';

/**
 * Layout Component
 * 
 * Industry Practice: Main layout with navigation and sidebar
 * 
 * Features:
 * - Responsive sidebar navigation
 * - User profile dropdown
 * - Active route highlighting
 * - Mobile-friendly design
 */
const Layout = () => {
  const dispatch = useAppDispatch();
  const user = useUser();
  const { sidebarOpen, currentPage } = useUI();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'New Interview', href: '/interview/setup', icon: '🎯' },
    { name: 'Interview History', href: '/interview/history', icon: '📚' },
    { name: 'Profile', href: '/profile', icon: '👤' },
  ];

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActiveRoute = (href) => {
    return location.pathname === href;
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="AI Powered Interview Prep"
              className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "block";
              }}
            />
            <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900 truncate">
              PrepMate AI
            </span>
          </div>
        </div>

        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() =>
                  dispatch(setCurrentPage(item.name.toLowerCase()))
                }
                className={`${
                  isActiveRoute(item.href)
                    ? "bg-blue-100 text-blue-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p
                className="text-sm font-medium text-gray-700 truncate"
                title={user?.email || "User"}
              >
                {user?.email || "User"}
              </p>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <button
                onClick={() => dispatch(toggleSidebar())}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 mr-4"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <h2 className="text-lg font-semibold text-gray-900 capitalize">
                {currentPage}
              </h2>
            </div>
            
            {/* Mobile User Info */}
            <div className="lg:hidden flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}
    </div>
  );
};

export default Layout;
