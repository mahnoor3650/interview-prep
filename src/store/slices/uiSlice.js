// src/store/slices/uiSlice.js
import { createSlice } from "@reduxjs/toolkit";

// UI state management for app-wide UI concerns
const initialState = {
  // Theme
  theme: "light", // 'light' | 'dark' | 'system'

  // Navigation
  sidebarOpen: false,
  currentPage: "dashboard",

  // Modals and overlays
  modals: {
    confirmDialog: {
      isOpen: false,
      title: "",
      message: "",
      onConfirm: null,
    },
    settingsModal: false,
    helpModal: false,
  },

  // Notifications/Toasts
  notifications: [],

  // Global loading states
  globalLoading: false,

  // Responsive design
  isMobile: false,
  screenSize: "desktop", // 'mobile' | 'tablet' | 'desktop'

  // Performance: Track component mounting for analytics
  mountedComponents: [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // Theme management
    setTheme: (state, action) => {
      state.theme = action.payload;
    },

    // Navigation
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },

    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },

    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },

    // Modal management
    openModal: (state, action) => {
      const { modalName, data } = action.payload;
      if (modalName === "confirmDialog") {
        state.modals.confirmDialog = { isOpen: true, ...data };
      } else {
        state.modals[modalName] = true;
      }
    },

    closeModal: (state, action) => {
      const modalName = action.payload;
      if (modalName === "confirmDialog") {
        state.modals.confirmDialog = {
          isOpen: false,
          title: "",
          message: "",
          onConfirm: null,
        };
      } else {
        state.modals[modalName] = false;
      }
    },

    // Notifications
    addNotification: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        timestamp: Date.now(),
        ...action.payload,
      };
      state.notifications.push(notification);
    },

    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },

    clearAllNotifications: (state) => {
      state.notifications = [];
    },

    // Global loading
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload;
    },

    // Responsive design
    setScreenSize: (state, action) => {
      state.screenSize = action.payload;
      state.isMobile = action.payload === "mobile";
    },

    // Performance tracking
    componentMounted: (state, action) => {
      if (!state.mountedComponents.includes(action.payload)) {
        state.mountedComponents.push(action.payload);
      }
    },

    componentUnmounted: (state, action) => {
      state.mountedComponents = state.mountedComponents.filter(
        (component) => component !== action.payload
      );
    },
  },
});

export const {
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  setCurrentPage,
  openModal,
  closeModal,
  addNotification,
  removeNotification,
  clearAllNotifications,
  setGlobalLoading,
  setScreenSize,
  componentMounted,
  componentUnmounted,
} = uiSlice.actions;

// Selectors
export const selectTheme = (state) => state.ui.theme;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectCurrentPage = (state) => state.ui.currentPage;
export const selectModals = (state) => state.ui.modals;
export const selectNotifications = (state) => state.ui.notifications;
export const selectGlobalLoading = (state) => state.ui.globalLoading;
export const selectScreenSize = (state) => state.ui.screenSize;
export const selectIsMobile = (state) => state.ui.isMobile;

export default uiSlice.reducer;
