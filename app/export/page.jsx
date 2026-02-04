'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Download, CheckCircle2, Clock, DollarSign, RefreshCw, Package } from 'lucide-react';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import { formatCurrency } from '@/lib/utils/helpers';
import toast from 'react-hot-toast';

export default function ExportPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get('productId');

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [productData, setProductData] = useState(null);
  const [exportData, setExportData] = useState(null);

  useEffect(() => {
    if (!productId) {
      router.push('/upload');
      return;
    }

    loadProductData();
  }, [productId]);

  const loadProductData = async () => {
    try {
      const response = await fetch(`/api/export?productId=${productId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setProductData(data.product);

      // If already completed, we're done
      if (data.product.status === 'completed' && data.product.zipUrl) {
        setExportData({
          zipUrl: data.product.zipUrl,
          stats: {
            totalImages: data.product.totalImages,
            timeSaved: calculateTimeSaved(data.product.totalImages),
            moneySaved: calculateMoneySaved(data.product.totalImages),
          },
        });
        setLoading(false);
      } else {
        // Need to create export
        await createExport();
      }
    } catch (error) {
      console.error('Load error:', error);
      toast.error(error.message);
      setLoading(false);
    }
  };

  const createExport = async () => {
    setExporting(true);
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setExportData(data);
      toast.success('Export ready!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error.message);
    } finally {
      setExporting(false);
      setLoading(false);
    }
  };

  const calculateTimeSaved = (imageCount) => {
    const minutes = imageCount * 7;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const calculateMoneySaved = (imageCount) => {
    return imageCount * 250;
  };

  const handleDownload = () => {
    if (exportData?.zipUrl) {
      window.open(exportData.zipUrl, '_blank');
      toast.success('Download started!');
    }
  };

  if (loading || exporting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader 
          size="lg" 
          text={exporting ? 'Creating your export...' : 'Loading...'} 
        />
      </div>
    );
  }

  if (!exportData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Export not found</p>
          <Link href="/upload">
            <Button>Start New Upload</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              PicPolish
            </Link>
            <Link href="/upload">
              <Button variant="secondary" size="sm">
                Process Another →
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-12 fade-in">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Product Ready!
          </h1>
          <p className="text-xl text-gray-600">
            All images optimized and organized for your marketplaces
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-green-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-sm text-gray-600">Money Saved</div>
            </div>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(exportData.stats.moneySaved)}
            </div>
            <p className="text-xs text-gray-500 mt-1">vs Fiverr @ ₹250/image</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-sm text-gray-600">Time Saved</div>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {exportData.stats.timeSaved}
            </div>
            <p className="text-xs text-gray-500 mt-1">vs manual @ 7min/image</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-sm text-gray-600">Images Processed</div>
            </div>
            <div className="text-3xl font-bold text-purple-600">
              {exportData.stats.totalImages}
            </div>
            <p className="text-xs text-gray-500 mt-1">Main + variants</p>
          </div>
        </div>

        {/* Download Section */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            📦 Your Package
          </h2>

          <div className="bg-primary-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {productData?.name || 'Product'}_PicPolish.zip
                </h3>
                <p className="text-sm text-gray-600">
                  Ready to download • Organized by marketplace
                </p>
              </div>
              <Button
                onClick={handleDownload}
                size="lg"
                className="flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download ZIP
              </Button>
            </div>
          </div>

          {/* Folder Structure Preview */}
          <div className="bg-gray-50 rounded-lg p-6 font-mono text-sm">
            <div className="text-gray-700">
              <div className="mb-2">📁 {productData?.name || 'Product'}_PicPolish.zip</div>
              <div className="ml-4 space-y-1">
                <div>├── 📁 Amazon/</div>
                <div className="ml-8">├── main_2000x2000.jpg</div>
                <div className="ml-8">└── UPLOAD_GUIDE.txt</div>
                <div>├── 📁 Flipkart/</div>
                <div className="ml-8">├── main_2000x2000.jpg</div>
                <div className="ml-8">└── UPLOAD_GUIDE.txt</div>
                {productData?.marketplaces?.includes('Meesho') && (
                  <>
                    <div>├── 📁 Meesho/</div>
                    <div className="ml-8">├── main_1600x1600.jpg</div>
                    <div className="ml-8">└── UPLOAD_GUIDE.txt</div>
                  </>
                )}
                {productData?.marketplaces?.includes('Shopify') && (
                  <>
                    <div>└── 📁 Shopify/</div>
                    <div className="ml-8">├── main_2048x2048.jpg</div>
                    <div className="ml-8">├── thumb_600x600.jpg</div>
                    <div className="ml-8">└── UPLOAD_GUIDE.txt</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-green-900 mb-3">
              ✅ All Images Are Marketplace-Compliant
            </h3>
            <ul className="space-y-2 text-sm text-green-800">
              <li>• Pure white background (RGB 255,255,255)</li>
              <li>• Correct dimensions for each marketplace</li>
              <li>• 85% product coverage</li>
              <li>• No text/watermarks on main images</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">
              📋 Upload Guides Included
            </h3>
            <p className="text-sm text-blue-800 mb-3">
              Each marketplace folder contains a guide showing:
            </p>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Upload order (main image first)</li>
              <li>• Image specifications</li>
              <li>• Compliance checklist</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/upload">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <RefreshCw className="w-5 h-5 mr-2" />
              Process Another Product
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              ← Back to Home
            </Button>
          </Link>
        </div>

        {/* Upgrade CTA */}
        <div className="mt-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-3">
            Love PicPolish?
          </h3>
          <p className="text-primary-100 mb-6">
            Upgrade to Pro for unlimited processing and advanced features
          </p>
          <Link href="/#pricing">
            <Button variant="secondary" size="lg">
              View Pricing Plans
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}