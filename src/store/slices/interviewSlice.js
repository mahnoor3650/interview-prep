// src/store/slices/interviewSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { freeAIService } from "../../services/freeAIService";
import { supabase } from "../../services/supabase";

// Industry Practice: Async thunks for complex interview operations
export const generateInterviewQuestion = createAsyncThunk(
  "interview/generateQuestion",
  async ({ category, difficulty, selectedLanguages = [], previousQuestions = [] }, { rejectWithValue }) => {
    try {
      const question = await freeAIService.generateQuestion(category, difficulty, previousQuestions, selectedLanguages);
      return question;
    } catch (error) {
      return rejectWithValue({
        message: error.message || "Failed to generate question",
        code: "QUESTION_GENERATION_ERROR",
      });
    }
  }
);

export const analyzeInterviewResponse = createAsyncThunk(
  "interview/analyzeResponse",
  async ({ question, response, context = {} }, { rejectWithValue }) => {
    try {
      const analysis = await freeAIService.analyzeResponse(question, response, context);
      return analysis;
    } catch (error) {
      return rejectWithValue({
        message: error.message || "Failed to analyze response",
        code: "ANALYSIS_ERROR",
      });
    }
  }
);

export const saveInterviewSession = createAsyncThunk(
  "interview/saveSession",
  async (sessionData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      if (!auth.user) {
        throw new Error("User must be authenticated to save sessions");
      }

      const { data, error } = await supabase
        .from("interview_sessions")
        .insert({
          user_id: auth.user.id,
          ...sessionData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue({
        message: error.message || "Failed to save interview session",
        code: "SAVE_SESSION_ERROR",
      });
    }
  }
);

export const loadInterviewHistory = createAsyncThunk(
  "interview/loadHistory",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      if (!auth.user) {
        throw new Error("User must be authenticated to load history");
      }

      const { data, error } = await supabase
        .from("interview_sessions")
        .select("*")
        .eq("user_id", auth.user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      return rejectWithValue({
        message: error.message || "Failed to load interview history",
        code: "LOAD_HISTORY_ERROR",
      });
    }
  }
);

// Industry Practice: Normalized state structure
const initialState = {
  // Current interview session
  currentSession: {
    id: null,
    questions: [],
    currentQuestionIndex: 0,
    responses: [],
    startTime: null,
    endTime: null,
    isActive: false,
    category: "general",
    difficulty: "intermediate",
  },

  // Generated question
  currentQuestion: null,
  isGeneratingQuestion: false,
  questionError: null,

  // Response analysis
  currentAnalysis: null,
  isAnalyzing: false,
  analysisError: null,

  // Interview history
  history: [],
  isLoadingHistory: false,
  historyError: null,

  // Session management
  isSavingSession: false,
  saveSessionError: null,

  // Performance tracking
  sessionStats: {
    totalQuestions: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    categoriesAttempted: [],
  },

  // UI state for interview flow
  interviewFlow: {
    step: "setup", // 'setup' | 'question' | 'response' | 'analysis' | 'complete'
    timer: {
      isActive: false,
      timeRemaining: 0,
      totalTime: 0,
    },
    showHints: false,
    autoSave: true,
  },
};

const interviewSlice = createSlice({
  name: "interview",
  initialState,
  reducers: {
    // Session management
    startNewSession: (state, action) => {
      const { category, difficulty, selectedLanguages = [] } = action.payload;
      state.currentSession = {
        id: Date.now().toString(),
        questions: [],
        currentQuestionIndex: 0,
        responses: [],
        startTime: new Date().toISOString(),
        endTime: null,
        isActive: true,
        category,
        difficulty,
        selectedLanguages,
      };
      state.interviewFlow.step = "setup";
      state.currentQuestion = null;
      state.currentAnalysis = null;
    },

    endCurrentSession: (state) => {
      state.currentSession.isActive = false;
      state.currentSession.endTime = new Date().toISOString();
      state.interviewFlow.step = "complete";
      state.interviewFlow.timer.isActive = false;
    },

    // Question navigation
    nextQuestion: (state) => {
      if (state.currentSession.currentQuestionIndex < state.currentSession.questions.length - 1) {
        state.currentSession.currentQuestionIndex += 1;
        state.currentQuestion = state.currentSession.questions[state.currentSession.currentQuestionIndex];
        state.currentAnalysis = null;
        state.interviewFlow.step = "question";
      }
    },

    previousQuestion: (state) => {
      if (state.currentSession.currentQuestionIndex > 0) {
        state.currentSession.currentQuestionIndex -= 1;
        state.currentQuestion = state.currentSession.questions[state.currentSession.currentQuestionIndex];
        state.currentAnalysis = null;
        state.interviewFlow.step = "question";
      }
    },

    // Response management
    saveResponse: (state, action) => {
      const { questionId, response, timeSpent } = action.payload;
      const existingResponseIndex = state.currentSession.responses.findIndex(
        (r) => r.questionId === questionId
      );

      const responseData = {
        questionId,
        response,
        timeSpent,
        timestamp: new Date().toISOString(),
      };

      if (existingResponseIndex >= 0) {
        state.currentSession.responses[existingResponseIndex] = responseData;
      } else {
        state.currentSession.responses.push(responseData);
      }
    },

    // Timer management
    startTimer: (state, action) => {
      const timeLimit = action.payload || 300; // 5 minutes default
      state.interviewFlow.timer = {
        isActive: true,
        timeRemaining: timeLimit,
        totalTime: timeLimit,
      };
    },

    updateTimer: (state, action) => {
      if (state.interviewFlow.timer.isActive) {
        state.interviewFlow.timer.timeRemaining = action.payload;
        if (action.payload <= 0) {
          state.interviewFlow.timer.isActive = false;
          state.interviewFlow.step = "analysis";
        }
      }
    },

    stopTimer: (state) => {
      state.interviewFlow.timer.isActive = false;
    },

    // Flow control
    setInterviewStep: (state, action) => {
      state.interviewFlow.step = action.payload;
    },

    toggleHints: (state) => {
      state.interviewFlow.showHints = !state.interviewFlow.showHints;
    },

    // Error handling
    clearQuestionError: (state) => {
      state.questionError = null;
    },

    clearAnalysisError: (state) => {
      state.analysisError = null;
    },

    clearSessionError: (state) => {
      state.saveSessionError = null;
    },

    clearHistoryError: (state) => {
      state.historyError = null;
    },

    // Reset state
    resetInterviewState: (state) => {
      return { ...initialState, history: state.history };
    },
  },

  // Handle async actions
  extraReducers: (builder) => {
    builder
      // Generate question cases
      .addCase(generateInterviewQuestion.pending, (state) => {
        state.isGeneratingQuestion = true;
        state.questionError = null;
      })
      .addCase(generateInterviewQuestion.fulfilled, (state, action) => {
        state.isGeneratingQuestion = false;
        state.currentQuestion = action.payload;
        state.currentSession.questions.push(action.payload);
        state.interviewFlow.step = "question";
        state.questionError = null;
      })
      .addCase(generateInterviewQuestion.rejected, (state, action) => {
        state.isGeneratingQuestion = false;
        state.questionError = action.payload;
      })

      // Analyze response cases
      .addCase(analyzeInterviewResponse.pending, (state) => {
        state.isAnalyzing = true;
        state.analysisError = null;
      })
      .addCase(analyzeInterviewResponse.fulfilled, (state, action) => {
        state.isAnalyzing = false;
        state.currentAnalysis = action.payload;
        state.interviewFlow.step = "analysis";
        state.analysisError = null;
      })
      .addCase(analyzeInterviewResponse.rejected, (state, action) => {
        state.isAnalyzing = false;
        state.analysisError = action.payload;
      })

      // Save session cases
      .addCase(saveInterviewSession.pending, (state) => {
        state.isSavingSession = true;
        state.saveSessionError = null;
      })
      .addCase(saveInterviewSession.fulfilled, (state, action) => {
        state.isSavingSession = false;
        state.history.unshift(action.payload);
        state.saveSessionError = null;
      })
      .addCase(saveInterviewSession.rejected, (state, action) => {
        state.isSavingSession = false;
        state.saveSessionError = action.payload;
      })

      // Load history cases
      .addCase(loadInterviewHistory.pending, (state) => {
        state.isLoadingHistory = true;
        state.historyError = null;
      })
      .addCase(loadInterviewHistory.fulfilled, (state, action) => {
        state.isLoadingHistory = false;
        state.history = action.payload;
        state.historyError = null;
      })
      .addCase(loadInterviewHistory.rejected, (state, action) => {
        state.isLoadingHistory = false;
        state.historyError = action.payload;
      });
  },
});

// Export actions
export const {
  startNewSession,
  endCurrentSession,
  nextQuestion,
  previousQuestion,
  saveResponse,
  startTimer,
  updateTimer,
  stopTimer,
  setInterviewStep,
  toggleHints,
  clearQuestionError,
  clearAnalysisError,
  clearSessionError,
  clearHistoryError,
  resetInterviewState,
} = interviewSlice.actions;

// Industry Practice: Memoized selectors for performance
export const selectInterview = (state) => state.interview;
export const selectCurrentSession = (state) => state.interview.currentSession;
export const selectCurrentQuestion = (state) => state.interview.currentQuestion;
export const selectCurrentAnalysis = (state) => state.interview.currentAnalysis;
export const selectInterviewHistory = (state) => state.interview.history;
export const selectInterviewFlow = (state) => state.interview.interviewFlow;
export const selectSessionStats = (state) => state.interview.sessionStats;
export const selectIsGeneratingQuestion = (state) => state.interview.isGeneratingQuestion;
export const selectIsAnalyzing = (state) => state.interview.isAnalyzing;
export const selectIsSavingSession = (state) => state.interview.isSavingSession;
export const selectIsLoadingHistory = (state) => state.interview.isLoadingHistory;

export default interviewSlice.reducer;
