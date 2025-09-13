// src/components/UI/LoadingSpinner.jsx
import { memo } from 'react';

/**
 * LoadingSpinner Component
 * 
 * Industry Practice: Reusable loading component with multiple sizes
 * 
 * Features:
 * - Multiple size variants (small, medium, large)
 * - Memoized for performance
 * - Accessible with proper ARIA labels
 * - Consistent styling with Tailwind
 */
const LoadingSpinner = memo(({ 
  size = 'medium', 
  className = '', 
  text = 'Loading...',
  showText = false 
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}
        role="status"
        aria-label={text}
      >
        <span className="sr-only">{text}</span>
      </div>
      {showText && (
        <p className={`mt-2 text-gray-600 ${textSizeClasses[size]}`}>
          {text}
        </p>
      )}
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
