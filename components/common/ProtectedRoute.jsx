'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import Loader from '@/components/common/Loader';

/**
 * Protected Route Component
 * Wrap any page that requires authentication
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <Loader fullScreen text="Loading..." />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}