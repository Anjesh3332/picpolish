'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import Button from '@/components/common/Button';
import toast from 'react-hot-toast';

export default function PricingPage() {
  const { user, profile, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(null);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      credits: 5,
      features: [
        '5 images (1 product)',
        'All marketplaces',
        'Basic support',
        'ZIP export',
      ],
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 199,
      credits: 20,
      popular: true,
      features: [
        '20 images (4 products)',
        'All marketplaces',
        'Priority support',
        'ZIP export',
        'No watermarks',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 499,
      credits: 50,
      features: [
        '50 images (10 products)',
        'All marketplaces',
        '24/7 support',
        'ZIP export',
        'No watermarks',
        'Bulk processing',
      ],
    },
  ];

  const handlePurchase = async (plan) => {
    if (!isAuthenticated) {
      toast.error('Please login to purchase');
      return;
    }

    if (plan.id === 'free') {
      toast('You\'re already on the free plan!');
      return;
    }

    setLoading(plan.id);

    try {
      // Create order in backend
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          amount: plan.price,
          credits: plan.credits,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      // Initialize Razorpay
      const options = {
        key: data.razorpayKeyId,
        amount: data.amount,
        currency: 'INR',
        name: 'PicPolish',
        description: `${plan.name} Plan - ${plan.credits} Credits`,
        order_id: data.orderId,
        handler: async function (response) {
          // Payment successful
          try {
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: data.orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              toast.success('Payment successful! Credits added to your account.');
              window.location.href = '/dashboard';
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          email: user?.email,
          name: profile?.full_name,
        },
        theme: {
          color: '#0ea5e9',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              PicPolish
            </Link>
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button variant="secondary">Dashboard</Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600">
            Choose the plan that fits your needs
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`
                bg-white rounded-xl border-2 p-8 relative
                ${plan.popular ? 'border-primary-600 shadow-lg' : 'border-gray-200'}
              `}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold mb-2">
                  {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                </div>
                <p className="text-gray-600">
                  {plan.credits} images
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handlePurchase(plan)}
                loading={loading === plan.id}
                disabled={loading !== null}
                className="w-full"
                variant={plan.popular ? 'primary' : 'secondary'}
              >
                {plan.id === 'free' ? 'Get Started' : 'Buy Now'}
              </Button>
            </div>
          ))}
        </div>

        {/* FAQ or Info */}
        <div className="mt-16 text-center">
          <p className="text-gray-600">
            Need more credits?{' '}
            <a href="mailto:support@picpolish.com" className="text-primary-600 hover:text-primary-700">
              Contact us
            </a>{' '}
            for enterprise pricing
          </p>
        </div>
      </main>
    </div>
  );
}