'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, LogOut, CreditCard, Download, TrendingUp } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { signOut } from '@/lib/supabase/authHelpers';
import { supabase } from '@/lib/supabase/client';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { formatCurrency, formatDate, calculateTimeSaved, calculateMoneySaved } from '@/lib/utils/helpers';
import toast from 'react-hot-toast';

function DashboardContent() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalImages: 0,
    timeSaved: 0,
    moneySaved: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      // Load user's products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (productsError) throw productsError;

      setProducts(productsData || []);

      // Load processing history stats
      const { data: historyData, error: historyError } = await supabase
        .from('processing_history')
        .select('*')
        .eq('user_id', user.id);

      if (historyError) throw historyError;

      // Calculate total stats
      const totalImages = historyData?.reduce((sum, h) => sum + h.images_processed, 0) || 0;
      const totalTimeSaved = historyData?.reduce((sum, h) => sum + h.time_saved_seconds, 0) || 0;
      const totalMoneySaved = historyData?.reduce((sum, h) => sum + h.money_saved_inr, 0) || 0;

      setStats({
        totalProducts: productsData?.length || 0,
        totalImages,
        timeSaved: totalTimeSaved,
        moneySaved: totalMoneySaved,
      });

    } catch (error) {
      console.error('Dashboard load error:', error);
      toast.error('Failed to load dashboard');
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

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (loading) {
    return <Loader fullScreen text="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              PicPolish
            </Link>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.full_name || user?.email}
                </p>
                <p className="text-xs text-gray-500">
                  {profile?.credits_remaining || 10} credits remaining
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-gray-600">
            {profile?.plan === 'free' 
              ? `You have ${profile?.credits_remaining || 0} free credits remaining`
              : 'Manage your products and view your stats'
            }
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link href="/upload">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Process New Images</h3>
                  <p className="text-primary-100 text-sm">
                    Upload and process product images
                  </p>
                </div>
                <Plus className="w-12 h-12 opacity-80" />
              </div>
            </div>
          </Link>

          <Link href="/pricing">
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary-300 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Buy Credits</h3>
                  <p className="text-gray-600 text-sm">
                    Get more processing credits
                  </p>
                </div>
                <CreditCard className="w-12 h-12 text-primary-600 opacity-80" />
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Products</span>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.totalProducts}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Images Processed</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.totalImages}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Time Saved</span>
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {formatTime(stats.timeSaved)}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Money Saved</span>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(stats.moneySaved)}
            </div>
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Recent Products</h2>
          </div>

          {products.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600 mb-4">No products yet</p>
              <Link href="/upload">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Process Your First Product
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {products.map((product) => (
                <div key={product.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>
                          {formatDate(product.created_at)}
                        </span>
                        <span>•</span>
                        <span>
                          {product.marketplaces?.join(', ')}
                        </span>
                        <span>•</span>
                        <span className={`
                          ${product.status === 'completed' ? 'text-green-600' : ''}
                          ${product.status === 'processing' ? 'text-blue-600' : ''}
                          ${product.status === 'failed' ? 'text-red-600' : ''}
                        `}>
                          {product.status}
                        </span>
                      </div>
                    </div>

                    {product.status === 'completed' && product.zip_url && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => window.open(product.zip_url, '_blank')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upgrade CTA (if free plan) */}
        {profile?.plan === 'free' && (
          <div className="mt-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-3">
              Upgrade to Pro
            </h3>
            <p className="text-primary-100 mb-6">
              Get unlimited processing and advanced features
            </p>
            <Link href="/pricing">
              <Button variant="secondary" size="lg">
                View Plans
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}