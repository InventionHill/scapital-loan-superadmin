import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService, User } from '@/services/authService';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async Thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);
      // Store tokens
      localStorage.setItem('accessToken', response.access_token);
      return response;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
          const apiError = err as { response: { data: { message: string } } };
          return rejectWithValue(apiError.response?.data?.message || 'Login failed');
      }
      return rejectWithValue('Login failed');
    }
  }
);

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        return rejectWithValue('No token found');
      }
      // Verify token / get user
      const user = await authService.getMe(); 
      return { user, accessToken: token };
    } catch {
        localStorage.removeItem('accessToken');
        return rejectWithValue('Session expired');
    }
  }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async () => {
        await authService.logout();
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async ({ name, email, password }: { name: string; email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await authService.register(name, email, password);
             // Store tokens
            localStorage.setItem('accessToken', response.access_token);
            return response;
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const apiError = err as { response: { data: { message: string } } };
                return rejectWithValue(apiError.response?.data?.message || 'Registration failed');
            }
            return rejectWithValue('Registration failed');
        }
    }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.access_token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Restore Session
    builder
        .addCase(restoreSession.pending, (state) => {
            state.loading = true;
        })
        .addCase(restoreSession.fulfilled, (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
        })
        .addCase(restoreSession.rejected, (state) => {
            state.loading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.accessToken = null;
        });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
    });

    // Register
    builder
        .addCase(register.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(register.fulfilled, (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.accessToken = action.payload.access_token;
        })
        .addCase(register.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
