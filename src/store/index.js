// src/store/index.js
import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import interviewSlice from "./slices/interviewSlice";
import uiSlice from "./slices/uiSlice";

// Industry Practice: Configure store with middleware and devtools
export const store = configureStore({
  reducer: {
    auth: authSlice,
    interview: interviewSlice,
    ui: uiSlice,
  },
  // Industry Practice: Configure middleware for better debugging and performance
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for Supabase compatibility
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
        // Ignore these paths in state for file uploads, dates, etc.
        ignoredPaths: [
          "auth.user.created_at",
          "interview.currentSession.started_at",
        ],
      },
      // Enable in development for better debugging
      immutableCheck: process.env.NODE_ENV === "development",
    }),
  // Industry Practice: Enable devtools only in development
  devTools: process.env.NODE_ENV === "development",
});

// Industry Practice: Export types for TypeScript-like experience
export const RootState = store.getState;
export const AppDispatch = store.dispatch;
