import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'PicPolish - Marketplace-Ready Product Images in 60 Seconds',
  description: 'AI-powered image processing for Amazon, Flipkart, Meesho & Shopify sellers. Remove backgrounds, resize, and organize images automatically.',
  keywords: 'product images, background removal, Amazon images, Flipkart images, Meesho, ecommerce, Indian sellers',
  authors: [{ name: 'PicPolish' }],
  openGraph: {
    title: 'PicPolish - Marketplace-Ready Product Images',
    description: 'Process product images for Indian marketplaces in 60 seconds',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#1a1a1a',
              border: '1px solid #e0e0e0',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}