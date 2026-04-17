import axios from '@/utils/axios';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>('v1/auth/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('accessToken', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
      const response = await axios.post<AuthResponse>('v1/auth/register', { 
          name, 
          email, 
          password 
      });
      if (response.data.access_token) {
        localStorage.setItem('accessToken', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }, 

  getMe: async (): Promise<User> => {
      const response = await axios.get<User>('v1/auth/me');
      return response.data;
  },

  logout: async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }
};
