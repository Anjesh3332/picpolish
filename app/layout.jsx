import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/hooks/useAuth';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'PicPolish - Marketplace-Ready Product Images in 60 Seconds',
  description: 'AI-powered image processing for Amazon, Flipkart, Meesho & Shopify sellers.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#1a1a1a',
            },
          }}
        />
      </body>
    </html>
  );
}