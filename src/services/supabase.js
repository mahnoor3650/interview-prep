// src/services/supabase.js
import { createClient } from '@supabase/supabase-js';

// Industry Practice: Environment variable validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  );
}

// Industry Practice: Create Supabase client with proper configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Security Practice: Auto refresh tokens
    autoRefreshToken: true,
    // Security Practice: Persist session in localStorage
    persistSession: true,
    // Security Practice: Detect session in URL (for OAuth flows)
    detectSessionInUrl: true,
    // Security Practice: Flow type for better UX
    flowType: 'pkce', // Proof Key for Code Exchange - more secure
  },
  // Performance Practice: Configure realtime settings
  realtime: {
    params: {
      eventsPerSecond: 10, // Limit events for performance
    },
  },
  // Performance Practice: Global configuration
  global: {
    headers: {
      'X-Client-Info': 'interview-prep-app',
    },
  },
});

// Industry Practice: Database service layer
export const databaseService = {
  // User profile management
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { data: null, error };
    }
  },

  async updateUserProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { data: null, error };
    }
  },

  // Interview sessions management
  async saveInterviewSession(sessionData) {
    try {
      const { data, error } = await supabase
        .from('interview_sessions')
        .insert({
          ...sessionData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error saving interview session:', error);
      return { data: null, error };
    }
  },

  async getInterviewHistory(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching interview history:', error);
      return { data: null, error };
    }
  },

  async getInterviewSession(sessionId) {
    try {
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching interview session:', error);
      return { data: null, error };
    }
  },

  // Question bank management
  async getQuestionBank(category = null, difficulty = null, limit = 100) {
    try {
      let query = supabase
        .from('question_bank')
        .select('*')
        .limit(limit);

      if (category) {
        query = query.eq('category', category);
      }

      if (difficulty) {
        query = query.eq('difficulty', difficulty);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching question bank:', error);
      return { data: null, error };
    }
  },

  async addQuestionToBank(questionData) {
    try {
      const { data, error } = await supabase
        .from('question_bank')
        .insert({
          ...questionData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error adding question to bank:', error);
      return { data: null, error };
    }
  },

  // Analytics and statistics
  async getUserStats(userId) {
    try {
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      // Calculate statistics
      const stats = {
        totalSessions: data.length,
        totalQuestions: data.reduce((sum, session) => sum + (session.questions?.length || 0), 0),
        averageScore: 0,
        totalTimeSpent: 0,
        categoriesAttempted: [],
        difficultyBreakdown: { beginner: 0, intermediate: 0, advanced: 0 },
        recentActivity: data.slice(0, 7), // Last 7 sessions
      };

      if (data.length > 0) {
        // Calculate average score
        const scores = data
          .map(session => session.averageScore)
          .filter(score => score !== null && score !== undefined);
        
        if (scores.length > 0) {
          stats.averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        }

        // Calculate total time spent
        stats.totalTimeSpent = data.reduce((sum, session) => {
          return sum + (session.totalTimeSpent || 0);
        }, 0);

        // Get unique categories
        stats.categoriesAttempted = [...new Set(data.map(session => session.category))];

        // Difficulty breakdown
        data.forEach(session => {
          if (session.difficulty && stats.difficultyBreakdown[session.difficulty] !== undefined) {
            stats.difficultyBreakdown[session.difficulty]++;
          }
        });
      }

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error calculating user stats:', error);
      return { data: null, error };
    }
  },
};

// Industry Practice: Auth service layer
export const authService = {
  async signUp(email, password, fullName) {
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
      return { data, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { data: null, error };
    }
  },

  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { data: null, error };
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { data: null, error };
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { data: user, error: null };
    } catch (error) {
      console.error('Error getting current user:', error);
      return { data: null, error };
    }
  },

  async resetPassword(email) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { data: null, error };
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Industry Practice: Error handling utility
export const handleSupabaseError = (error) => {
  if (!error) return { message: 'Unknown error occurred', code: 'UNKNOWN_ERROR' };

  // Common Supabase error codes and their user-friendly messages
  const errorMessages = {
    'invalid_credentials': 'Invalid email or password. Please try again.',
    'email_not_confirmed': 'Please check your email and click the confirmation link.',
    'user_not_found': 'No account found with this email address.',
    'email_address_invalid': 'Please enter a valid email address.',
    'password_too_short': 'Password must be at least 6 characters long.',
    'weak_password': 'Password is too weak. Please choose a stronger password.',
    'email_address_not_authorized': 'This email address is not authorized.',
    'signup_disabled': 'New account registration is currently disabled.',
    'too_many_requests': 'Too many requests. Please try again later.',
  };

  return {
    message: errorMessages[error.message] || error.message || 'An error occurred',
    code: error.code || 'SUPABASE_ERROR',
    details: error.details || null,
  };
};

// Industry Practice: Health check
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);

    return {
      connected: !error,
      error: error ? handleSupabaseError(error) : null,
    };
  } catch (error) {
    return {
      connected: false,
      error: handleSupabaseError(error),
    };
  }
};

export default supabase;
