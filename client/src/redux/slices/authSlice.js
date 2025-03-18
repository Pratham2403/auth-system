import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { authConfig } from '../../config/authConfig';
import { setToken, removeToken, getToken } from '../../utils/storageManager';

// Create axios instance
const api = axios.create({
  baseURL: authConfig.api.baseUrl,
  withCredentials: true
});

// Add token to requests if using local or session storage
api.interceptors.request.use(
  (config) => {
    const storageType = localStorage.getItem('storageType') || authConfig.defaultStorage;
    const token = getToken(storageType);
    
    if (token && storageType !== 'cookie') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password, storageType }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `${authConfig.api.auth.register}?storage=${storageType}`,
        { name, email, password }
      );
      
      // Save storage type preference
      localStorage.setItem('storageType', storageType);
      
      // Save token if not using cookies
      if (storageType !== 'cookie' && response.data.token) {
        setToken(response.data.token, storageType);
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed'
      );
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password, storageType }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `${authConfig.api.auth.login}?storage=${storageType}`,
        { email, password }
      );
      
      // Save storage type preference
      localStorage.setItem('storageType', storageType);
      
      // Save token if not using cookies
      if (storageType !== 'cookie' && response.data.token) {
        setToken(response.data.token, storageType);
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed'
      );
    }
  }
);

// Logout user
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue, getState }) => {
    try {
      const storageType = localStorage.getItem('storageType') || authConfig.defaultStorage;
      
      // Call logout endpoint if using cookies
      if (storageType === 'cookie') {
        await api.get(authConfig.api.auth.logout);
      }
      
      // Remove token from storage
      removeToken(storageType);
      
      return null;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Logout failed'
      );
    }
  }
);

// Get current user
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(authConfig.api.auth.me);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get user'
      );
    }
  }
);

// Update user profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ name, email }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        authConfig.api.user.profile,
        { name, email }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update profile'
      );
    }
  }
);

// Update user password
export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        authConfig.api.user.password,
        { currentPassword, newPassword }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update password'
      );
    }
  }
);

// Delete user account
export const deleteAccount = createAsyncThunk(
  'auth/deleteAccount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete(authConfig.api.user.delete);
      
      // Remove token from storage
      const storageType = localStorage.getItem('storageType') || authConfig.defaultStorage;
      removeToken(storageType);
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete account'
      );
    }
  }
);

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  success: false,
  message: ''
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
      state.message = '';
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.success = true;
        state.message = 'Registration successful';
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.success = true;
        state.message = 'Login successful';
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.success = true;
        state.message = 'Logout successful';
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.success = true;
        state.message = 'Profile updated successfully';
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update password
      .addCase(updatePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.message = 'Password updated successfully';
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete account
      .addCase(deleteAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.success = true;
        state.message = 'Account deleted successfully';
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearSuccess, setCredentials } = authSlice.actions;

export default authSlice.reducer;