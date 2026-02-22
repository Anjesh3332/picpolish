'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { updateUserProfile, signOut } from '@/lib/supabase/authHelpers';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { User, CreditCard, LogOut, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

function ProfileContent() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    email: user?.email || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateUserProfile(user.id, {
        full_name: formData.fullName,
      });
      await refreshProfile();
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              PicPolish
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Profile Settings
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 rounded-lg bg-primary-50 text-primary-700 font-medium">
              <User className="w-4 h-4 inline mr-2" />
              Account
            </button>
            <Link href="/pricing">
              <button className="w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100">
                <CreditCard className="w-4 h-4 inline mr-2" />
                Billing
              </button>
            </Link>
          </div>

          {/* Main Form */}
          <div className="md:col-span-2">
            {/* Account Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Account Information
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Full Name"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="John Doe"
                />

                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-gray-50 cursor-not-allowed"
                />

                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                >
                  Save Changes
                </Button>
              </form>
            </div>

            {/* Plan Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Current Plan
              </h2>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900 capitalize">
                    {profile?.plan || 'Free'} Plan
                  </p>
                  <p className="text-sm text-gray-600">
                    {profile?.credits_remaining || 0} credits remaining
                  </p>
                </div>
                <Link href="/pricing">
                  <Button variant="outline">
                    Upgrade
                  </Button>
                </Link>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-xl border border-red-200 p-6">
              <h2 className="text-xl font-semibold text-red-600 mb-4">
                Danger Zone
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Sign Out</p>
                    <p className="text-sm text-gray-600">
                      Sign out from your account
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}