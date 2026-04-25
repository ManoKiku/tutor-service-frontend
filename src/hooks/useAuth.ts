import { useState, useEffect, useCallback } from 'react';
import { User, LoginRequest, AuthResponse, RegisterRequest } from '@/types/auth';
import { login as apiLogin, register as apiRegister, refreshToken } from '@/services/auth-data';
import { getTutorProfileByUserId as apiGetTutorProfile } from '@/services/tutors';
import { 
  saveAuthData, 
  clearAuthData, 
  getAuthData, 
  isAuthenticated as checkAuth,
  saveTutorProfile,
  isTokenExpired
} from '@/lib/auth';

interface UseAuthReturn {
  user: User | null;
  tutorId: string | null;
  tutorProfile: Tutor | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (registerData: RegisterRequest) => Promise<void>;
  logout: () => void;
  loadTutorProfile: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [tutorId, setTutorId] = useState<string | null>(null);
  const [tutorProfile, setTutorProfile] = useState<Tutor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        let { user: storedUser, tutorId: storedTutorId, tutorProfile: storedTutorProfile, token } = getAuthData(false);

        if (token && isTokenExpired(token)) {
          try {
            const data = await refreshToken();
            saveAuthData(data.refreshToken, data.token, new Date(data.expiration), data.user);
            const freshData = getAuthData(false);
            storedUser = freshData.user;
            storedTutorId = freshData.tutorId;
            storedTutorProfile = freshData.tutorProfile;
          } catch (error) {
            clearAuthData();
            storedUser = null;
            storedTutorId = null;
            storedTutorProfile = null;
            console.error('Token refresh failed, logging out');
          }
        }

        setUser(storedUser);
        setTutorId(storedTutorId);
        setTutorProfile(storedTutorProfile);
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const loadTutorProfile = useCallback(async () => {
    const { user } = getAuthData(false);
    if (user) {
      try {
        const profile = await apiGetTutorProfile(user.id);
        if (profile) {
          setTutorId(profile.id);
          setTutorProfile(profile);
          saveTutorProfile(profile);
        }
      } catch (error) {
        console.error('Error loading tutor profile:', error);
      }
    }
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response: AuthResponse = await apiLogin(credentials);
      saveAuthData(response.refreshToken, response.token, new Date(response.expiration), response.user);
      setUser(response.user);
      
      if (response.user.role === 1 || response.user.role === 'Tutor') {
        await loadTutorProfile();
      }
      
      window.location.href = '/';
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadTutorProfile]);

  const register = useCallback(async (registerData: RegisterRequest) => {
    setIsLoading(true);
    try {
      const response: AuthResponse = await apiRegister(registerData);
      saveAuthData(response.refreshToken, response.token, new Date(response.expiration), response.user);
      setUser(response.user);
      
      if (registerData.role === 1) {
        window.location.href = '/tutor/profile-setup';
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearAuthData();
    setUser(null);
    setTutorId(null);
    setTutorProfile(null);
    window.location.href = '/login';
  }, []);

  return {
    user,
    tutorId,
    tutorProfile,
    isLoading,
    isAuthenticated: checkAuth(),
    login,
    register,
    logout,
    loadTutorProfile,
  };
}