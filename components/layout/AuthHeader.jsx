'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { signOut } from '@/lib/supabase/authHelpers';
import Button from '@/components/common/Button';
import { LogOut, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuthHeader() {
  const { user, profile, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Sign out failed');
    }
  };

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            PicPolish
          </Link>

          <nav className="hidden md:flex space-x-8">
            <a href="/#how-it-works" className="text-gray-600 hover:text-gray-900">
              How it Works
            </a>
            <a href="/#pricing" className="text-gray-600 hover:text-gray-900">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {profile?.full_name || user?.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    {profile?.credits_remaining || 0} credits
                  </p>
                </div>

                <Link href="/dashboard">
                  <Button variant="secondary" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="secondary" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}