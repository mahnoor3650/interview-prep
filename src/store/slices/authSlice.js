// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../services/supabase";

// Industry Practice: Async thunks for API calls
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Security Practice: Don't store sensitive data in Redux
      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          created_at: data.user.created_at,
        },
        session: {
          access_token: data.session?.access_token,
          expires_at: data.session?.expires_at,
        },
      };
    } catch (error) {
      // Industry Practice: Consistent error handling
      return rejectWithValue({
        message: error.message || "Login failed",
        code: error.error_description || "AUTH_ERROR",
      });
    }
  }
);

export const signUpUser = createAsyncThunk(
  "auth/signUp",
  async ({ email, password, fullName }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      return {
        user: data.user,
        needsConfirmation: !data.session, // Email confirmation needed
      };
    } catch (error) {
      return rejectWithValue({
        message: error.message || "Sign up failed",
        code: error.error_description || "SIGNUP_ERROR",
      });
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    } catch (error) {
      return rejectWithValue({
        message: error.message || "Logout failed",
        code: "LOGOUT_ERROR",
      });
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      
      // If there's an error, only reject if it's not a "not authenticated" error
      if (error) {
        // Don't treat "not authenticated" as an error - this is normal for login/signup pages
        if (error.message?.includes('session_not_found') || 
            error.message?.includes('Auth session missing') ||
            error.message?.includes('Invalid JWT')) {
          return null; // Return null instead of rejecting
        }
        throw error;
      }

      if (!user) return null;

      return {
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
        },
      };
    } catch (error) {
      return rejectWithValue({
        message: error.message || "Failed to get current user",
        code: "GET_USER_ERROR",
      });
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (email, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      return { message: "Password reset email sent successfully" };
    } catch (error) {
      return rejectWithValue({
        message: error.message || "Failed to send reset email",
        code: "RESET_PASSWORD_ERROR",
      });
    }
  }
);

export const updatePassword = createAsyncThunk(
  "auth/updatePassword",
  async (newPassword, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return { message: "Password updated successfully" };
    } catch (error) {
      return rejectWithValue({
        message: error.message || "Failed to update password",
        code: "UPDATE_PASSWORD_ERROR",
      });
    }
  }
);

// Industry Practice: Normalized initial state
const initialState = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false, // Track if initial auth check is complete
  error: null,
  needsEmailConfirmation: false,

  // Performance Practice: Track loading states separately
  loadingStates: {
    login: false,
    signUp: false,
    logout: false,
    getCurrentUser: false,
    resetPassword: false,
    updatePassword: false,
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Industry Practice: Synchronous actions for immediate state updates
    clearError: (state) => {
      state.error = null;
    },

    clearUser: (state) => {
      // Security Practice: Clear all sensitive data
      state.user = null;
      state.session = null;
      state.isAuthenticated = false;
      state.needsEmailConfirmation = false;
    },

    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    setEmailConfirmed: (state) => {
      state.needsEmailConfirmation = false;
    },

    setInitialized: (state) => {
      state.isInitialized = true;
    },
  },

  // Industry Practice: Handle async actions with extraReducers
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loadingStates.login = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loadingStates.login = false;
        state.user = action.payload.user;
        state.session = action.payload.session;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loadingStates.login = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // Sign up cases
      .addCase(signUpUser.pending, (state) => {
        state.loadingStates.signUp = true;
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.loadingStates.signUp = false;
        state.needsEmailConfirmation = action.payload.needsConfirmation;
        if (action.payload.user && !action.payload.needsConfirmation) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
        }
        state.error = null;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.loadingStates.signUp = false;
        state.error = action.payload;
      })

      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.loadingStates.logout = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loadingStates.logout = false;
        state.user = null;
        state.session = null;
        state.isAuthenticated = false;
        state.error = null;
        state.needsEmailConfirmation = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loadingStates.logout = false;
        state.error = action.payload;
      })

      // Get current user cases
      .addCase(getCurrentUser.pending, (state) => {
        state.loadingStates.getCurrentUser = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loadingStates.getCurrentUser = false;
        state.isInitialized = true;
        if (action.payload) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
        }
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loadingStates.getCurrentUser = false;
        state.isInitialized = true;
        // Only set error if it's not a "not authenticated" error
        if (action.payload?.code !== 'GET_USER_ERROR' || 
            !action.payload?.message?.includes('session_not_found') &&
            !action.payload?.message?.includes('Auth session missing') &&
            !action.payload?.message?.includes('Invalid JWT')) {
          state.error = action.payload;
        }
      })

      // Reset password cases
      .addCase(resetPassword.pending, (state) => {
        state.loadingStates.resetPassword = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loadingStates.resetPassword = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loadingStates.resetPassword = false;
        state.error = action.payload;
      })

      // Update password cases
      .addCase(updatePassword.pending, (state) => {
        state.loadingStates.updatePassword = true;
        state.error = null;
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.loadingStates.updatePassword = false;
        state.error = null;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.loadingStates.updatePassword = false;
        state.error = action.payload;
      });
  },
});

// Industry Practice: Export actions and selectors
export const { clearError, clearUser, updateUserProfile, setEmailConfirmed, setInitialized } =
  authSlice.actions;

// Industry Practice: Memoized selectors for performance
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectNeedsEmailConfirmation = (state) =>
  state.auth.needsEmailConfirmation;
export const selectLoginLoading = (state) => state.auth.loadingStates.login;
export const selectIsInitialized = (state) => state.auth.isInitialized;

export default authSlice.reducer;
