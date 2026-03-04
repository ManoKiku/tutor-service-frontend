import { refreshToken } from '@/services/auth-data';
import { User, DecodedToken } from '@/types/auth';
  
export function saveAuthData(refreshToken: string, token: string, tokenExpiration: Date, user: User): void {
  localStorage.setItem('token', token);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token_expiration', tokenExpiration.toISOString());
}

export function saveTutorProfile(profile: Tutor): void {
  localStorage.setItem('tutorId', profile.id);
  localStorage.setItem('tutorProfile', JSON.stringify(profile));
}

export function getAuthData(clearDataIfExpired: boolean = true): { 
  token: string | null; 
  user: User | null;
  tutorId: string | null;
  tutorProfile: Tutor | null;
} {
  if (typeof window === 'undefined') {
    return { token: null, user: null, tutorId: null, tutorProfile: null };
  }

  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const tutorId = localStorage.getItem('tutorId');
  const tutorProfileStr = localStorage.getItem('tutorProfile');
  
  let user: User | null = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }

  let tutorProfile: Tutor | null = null;
  if (tutorProfileStr) {
    try {
      tutorProfile = JSON.parse(tutorProfileStr);
    } catch (error) {
      console.error('Error parsing tutor profile:', error);
    }
  }

  if (clearDataIfExpired && token && isTokenExpired(token)) {
    clearAuthData();
  }

  return { token, user, tutorId, tutorProfile };
}

export function getTutorId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('tutorId');
}

export function getTutorProfile(): Tutor | null {
  const { tutorProfile } = getAuthData(false);
  return tutorProfile;
}

export function clearAuthData(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('tutorId');
  localStorage.removeItem('tutorProfile');
  localStorage.removeItem('token_expiration');
}

export function decodeToken(token: string): DecodedToken | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

export function isAuthenticated(): boolean {
  const { token } = getAuthData(false);
  return !!token && !isTokenExpired(token);
}

export function getCurrentUser(): User | null {
  const { user } = getAuthData(false);
  return user;
}

export function isTutor(): boolean {
  const user = getCurrentUser();
  return user?.role === 1 || user?.role === 'Tutor';
}

export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === 2 || user?.role === 'Admin';
}

export function hasRole(role: string | number): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  
  return typeof role === 'number' 
    ? user.role === role 
    : user.role.toString() === role;
}