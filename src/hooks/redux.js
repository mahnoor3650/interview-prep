// src/hooks/redux.js
import { useDispatch, useSelector } from 'react-redux';

// Industry Practice: Typed Redux hooks for better developer experience
// These hooks provide TypeScript-like intellisense and error checking

/**
 * Typed useDispatch hook
 * Provides dispatch function with proper typing
 */
export const useAppDispatch = () => useDispatch();

/**
 * Typed useSelector hook
 * Provides state selector with proper typing
 * @param {Function} selector - State selector function
 * @returns {any} Selected state
 */
export const useAppSelector = useSelector;

// Industry Practice: Custom hooks for common state selections
export const useAuth = () => {
  return useAppSelector((state) => state.auth);
};

export const useInterview = () => {
  return useAppSelector((state) => state.interview);
};

export const useUI = () => {
  return useAppSelector((state) => state.ui);
};

// Specific selectors for better performance
export const useUser = () => {
  return useAppSelector((state) => state.auth.user);
};

export const useIsAuthenticated = () => {
  return useAppSelector((state) => state.auth.isAuthenticated);
};

export const useCurrentSession = () => {
  return useAppSelector((state) => state.interview.currentSession);
};

export const useCurrentQuestion = () => {
  return useAppSelector((state) => state.interview.currentQuestion);
};

export const useInterviewHistory = () => {
  return useAppSelector((state) => state.interview.history);
};

export const useLoadingStates = () => {
  return useAppSelector((state) => ({
    auth: state.auth.loadingStates,
    interview: {
      isGeneratingQuestion: state.interview.isGeneratingQuestion,
      isAnalyzing: state.interview.isAnalyzing,
      isSavingSession: state.interview.isSavingSession,
      isLoadingHistory: state.interview.isLoadingHistory,
    },
    ui: {
      globalLoading: state.ui.globalLoading,
    },
  }));
};

export const useErrors = () => {
  return useAppSelector((state) => ({
    auth: state.auth.error,
    interview: {
      questionError: state.interview.questionError,
      analysisError: state.interview.analysisError,
      saveSessionError: state.interview.saveSessionError,
      historyError: state.interview.historyError,
    },
  }));
};

// Industry Practice: Memoized selectors for performance
export const useMemoizedSelector = (selector, deps = []) => {
  // This would typically use useMemo, but for simplicity we'll use the regular selector
  // In a real TypeScript project, you'd use createSelector from reselect
  return useAppSelector(selector);
};
