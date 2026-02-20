'use client';

import { useState } from 'react';
import Link from 'next/link';
import { resetPassword } from '@/lib/supabase/authHelpers';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await resetPassword(email);
      setSent(true);
      toast.success('Password reset link sent to your email');
    } catch (error) {
      console.error('Reset error:', error);
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-primary-600">
            PicPolish
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-gray-600">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />

              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                Send reset link
              </Button>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Check your email
              </h3>
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to<br />
                <strong>{email}</strong>
              </p>
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to login
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}