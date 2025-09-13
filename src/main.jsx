// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'

import App from './App.jsx'
import { store } from './store/index.js'
import { SpeechRecognitionProvider } from './components/Providers/SpeechRecognitionProvider'
import './index.css'

// Performance: Configure React Query for caching and background updates
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Performance: Cache data for 5 minutes
      staleTime: 1000 * 60 * 5,
      // Performance: Keep data in cache for 10 minutes
      cacheTime: 1000 * 60 * 10,
      // Performance: Don't refetch on window focus in development
      refetchOnWindowFocus: import.meta.env.PROD,
      // Retry failed requests 2 times
      retry: 2,
      // Performance: Background refetch every 5 minutes
      refetchInterval: 1000 * 60 * 5,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
})

// Industry Practice: Error boundary for React Query
import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-4">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Try again
        </button>
        {import.meta.env.DEV && (
          <details className="mt-4 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer">
              Error details (Dev only)
            </summary>
            <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

// Performance: Toast configuration
const toastOptions = {
  // Position toasts at top-right
  position: 'top-right',
  // Auto-dismiss after 4 seconds
  duration: 4000,
  // Global styling
  style: {
    background: '#363636',
    color: '#fff',
    borderRadius: '8px',
  },
  // Custom styling for different types
  success: {
    style: {
      background: '#10B981',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#10B981',
    },
  },
  error: {
    style: {
      background: '#EF4444',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#EF4444',
    },
  },
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        // Log errors in development
        if (import.meta.env.DEV) {
          console.error('React Error Boundary caught an error:', error, errorInfo)
        }
        
        // In production, you would send this to an error tracking service
        // like Sentry, LogRocket, etc.
      }}
      onReset={() => {
        // Clear any error state
        queryClient.clear()
        window.location.reload()
      }}
    >
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <SpeechRecognitionProvider>
            <App />
            <Toaster toastOptions={toastOptions} />
            {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
          </SpeechRecognitionProvider>
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>,
)

// Performance: Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration)
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError)
      })
  })
}
