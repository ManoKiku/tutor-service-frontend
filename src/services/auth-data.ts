import { AuthResponse, LoginRequest, RegisterRequest } from '@/types/auth';
import { appConfig } from '../../next.config';
import { isTokenExpired } from '@/lib/auth';

const API_BASE_URL = appConfig.apiUrl;
const ENDPOINT = 'auth';
let refreshPromise: Promise<AuthResponse> | null = null;

export async function refreshToken(): Promise<AuthResponse> {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch(`${API_BASE_URL}/${ENDPOINT}/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tutorId');
    localStorage.removeItem('tutorProfile');

    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data as AuthResponse;
}

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/${ENDPOINT}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  return response.json();
}

export async function fetchWithAuth<T>(url: string, options: RequestInit = {}, useAppJson: boolean = true): Promise<T | null> {
    let token = localStorage.getItem('token');
  
  if (token && isTokenExpired(token)) {
    if (!refreshPromise) {
      refreshPromise = refreshToken().finally(() => {
        refreshPromise = null;
      });
    }
    token = (await refreshPromise).token;
  }
  
  const headers : any = {
    ...options.headers,
  };

  if(useAppJson)
  {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      window.location.href = '/login';
    }
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }

    if (response.status === 204) {
      return null; 
    }
    return response.json(); 
}

export async function register(registerData: RegisterRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/${ENDPOINT}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(registerData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  return response.json();
}