import  clsx  from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes
 */
export function cn(...inputs) {
  const classes = inputs.filter(Boolean).join(' ');
  return classes;
}

// export function cn(...inputs) {
//   return twMerge(clsx(inputs));
// }

/**
 * Format file size to human readable format
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Generate unique ID
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sanitize filename
 */
export function sanitizeFileName(fileName) {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

/**
 * Calculate time saved (7 minutes per image manually)
 */
export function calculateTimeSaved(imageCount) {
  const minutesPerImage = 7;
  const totalMinutes = imageCount * minutesPerImage;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours === 0) {
    return `${minutes} minutes`;
  }
  return `${hours}h ${minutes}m`;
}

/**
 * Calculate money saved (₹250 per image on Fiverr)
 */
export function calculateMoneySaved(imageCount) {
  const pricePerImage = 250; // INR
  return imageCount * pricePerImage;
}

/**
 * Format currency (INR)
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Validate email
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Sleep/delay function
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get file extension
 */
export function getFileExtension(filename) {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

/**
 * Check if browser supports required features
 */
export function checkBrowserSupport() {
  const requiredFeatures = {
    fileReader: typeof FileReader !== 'undefined',
    canvas: typeof HTMLCanvasElement !== 'undefined',
    blob: typeof Blob !== 'undefined',
  };
  
  const unsupported = Object.entries(requiredFeatures)
    .filter(([, supported]) => !supported)
    .map(([feature]) => feature);
  
  return {
    supported: unsupported.length === 0,
    unsupported,
  };
}

/**
 * Download file
 */
export function downloadFile(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Convert base64 to blob
 */
export function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Get marketplace display name
 */
export function getMarketplaceName(key) {
  const names = {
    Amazon: 'Amazon India',
    Flipkart: 'Flipkart',
    Meesho: 'Meesho',
    Shopify: 'Shopify',
  };
  return names[key] || key;
}

/**
 * Truncate text
 */
export function truncate(str, length = 50) {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Format date
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value, total) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}