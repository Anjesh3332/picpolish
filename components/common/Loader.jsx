import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

/**
 * Loading spinner component
 * 
 * @param {Object} props
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 * @param {string} props.text - Optional loading text
 * @param {boolean} props.fullScreen - Show as fullscreen overlay
 */
export default function Loader({ 
  size = 'md', 
  text = '', 
  fullScreen = false,
  className 
}) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  
  const loader = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className={cn('animate-spin text-primary-600', sizes[size])} />
      {text && <p className="text-gray-600 text-sm">{text}</p>}
    </div>
  );
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {loader}
      </div>
    );
  }
  
  return loader;
}