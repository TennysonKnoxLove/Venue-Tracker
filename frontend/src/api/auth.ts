import axios from 'axios';
import { User, LoginCredentials, RegisterData, AuthTokens } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

interface LoginResponse {
  user: {
    id: number;
    username: string;
    email: string;
  };
  access: string;
  refresh: string;
}

interface TokenResponse {
  access: string;
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const response = await axios.post(`${API_URL}/auth/login/`, { username, password });
  return response.data;
};

export const register = async (username: string, email: string, password: string): Promise<any> => {
  const response = await axios.post(`${API_URL}/auth/register/`, { username, email, password });
  return response.data;
};

export const refreshToken = async (): Promise<TokenResponse | null> => {
  const refresh = localStorage.getItem('refresh_token');
  
  if (!refresh) {
    return null;
  }
  
  const response = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh });
  return response.data;
};

export const logout = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await axios.get(`${API_URL}/auth/user/`);
  return response.data;
};

export const updateUser = async (data: Partial<User>): Promise<User> => {
  const response = await axios.patch(`${API_URL}/auth/user/`, data);
  return response.data;
}; 