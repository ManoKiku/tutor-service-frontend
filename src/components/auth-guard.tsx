'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string | number;
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user) {
    const hasAccess = typeof requiredRole === 'number' 
      ? user.role === requiredRole 
      : user.role.toString() === requiredRole;
    
    if (!hasAccess) {
      return (
        <div>
          <h1>Access Denied</h1>
          <p>You don't have permission to view this page.</p>
        </div>
      );
    }
  }

  return <>{children}</>;
}