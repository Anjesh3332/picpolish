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
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (productsError) throw productsError;

      setProducts(productsData || []);

      const { data: historyData, error: historyError } = await supabase
        .from('processing_history')
        .select('*')
        .eq('user_id', user.id);

      if (historyError) throw historyError;

      const totalImages =
        historyData?.reduce((sum, h) => sum + h.images_processed, 0) || 0;
      const totalTimeSaved =
        historyData?.reduce((sum, h) => sum + h.time_saved_seconds, 0) || 0;
      const totalMoneySaved =
        historyData?.reduce((sum, h) => sum + h.money_saved_inr, 0) || 0;

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
              <Link href="/profile">
                <Button variant="secondary" size="sm">Profile</Button>
              </Link>
              <Link href="/payments">
                <Button variant="secondary" size="sm">Payments</Button>
              </Link>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-gray-600">
            {profile?.plan === 'free'
              ? `You have ${profile?.credits_remaining || 0} free credits remaining`
              : 'Manage your products and view your stats'}
          </p>
        </div>

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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm text-gray-500">Products</h4>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm text-gray-500">Images Processed</h4>
                <p className="text-2xl font-bold">{stats.totalImages}</p>
              </div>
              <Download className="w-8 h-8 text-primary-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm text-gray-500">Time Saved</h4>
                <p className="text-2xl font-bold">{formatTime(stats.timeSaved)}</p>
              </div>
              <div className="text-primary-600 font-semibold">{formatCurrency(calculateMoneySaved(stats.moneySaved))}</div>
            </div>
          </div>
        </div>

        {/* Recent Products */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Recent Products</h2>
          {products.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center text-gray-600">
              No products yet. Start by processing new images.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white shadow rounded-lg p-4 flex flex-col">
                  <img
                    src={product.thumbnail || '/images/placeholder.png'}
                    alt={product.name}
                    className="mb-4 rounded-lg h-48 w-full object-cover"
                  />
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.status || 'Unknown'}</p>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm">Download</Button>
                    <Button size="sm" variant="secondary">Details</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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