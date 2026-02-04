'use client';

import { Lock, Star, Image as ImageIcon } from 'lucide-react';
import Button from '@/components/common/Button';
import { cn } from '@/lib/utils/helpers';

/**
 * Product tree component
 * Shows main image (locked) and secondary images organized
 * 
 * @param {Object} productData - Product data with images
 * @param {Function} onChangeMain - Callback to change main image
 * @param {Function} onConfirm - Callback when user confirms
 */
export default function ProductTree({ 
  productData,
  onChangeMain,
  onConfirm 
}) {
  const { name, category, images, suggestedMainIndex } = productData;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
      {/* Product Info */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            📦 Product: {name || 'Untitled Product'}
          </h3>
          <p className="text-sm text-gray-600">
            Category: {category || 'Other'}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {/* Handle category change */}}
        >
          Change Category
        </Button>
      </div>

      {/* Main Image */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Lock className="w-5 h-5 text-red-600" />
          <h4 className="font-semibold text-gray-900">MAIN IMAGE (suggested)</h4>
          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
            ✓ Best Quality
          </span>
        </div>

        <div className="relative border-2 border-primary-600 rounded-lg overflow-hidden bg-gray-50">
          <div className="aspect-square">
            {images[suggestedMainIndex] && (
              <img
                src={images[suggestedMainIndex].preview}
                alt="Main product"
                className="w-full h-full object-contain p-4"
              />
            )}
          </div>
          
          {/* Locked badge */}
          <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Locked for Compliance
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-2">
          This image will be processed automatically with pure white background
        </p>
      </div>

      {/* Secondary Images */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">
          SECONDARY IMAGES
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {images
            .filter((_, index) => index !== suggestedMainIndex)
            .map((img, index) => (
              <div
                key={img.id}
                className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white hover:border-primary-300 transition-all cursor-pointer group"
              >
                <div className="aspect-square relative">
                  <img
                    src={img.preview}
                    alt={`Image ${index + 2}`}
                    className="w-full h-full object-contain p-2"
                  />
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
                </div>
                
                <div className="p-2 bg-gray-50 text-center">
                  <span className="text-xs text-gray-600 font-medium">
                    Image {index + 2}
                  </span>
                </div>
              </div>
            ))}
        </div>

        {images.length <= 1 && (
          <div className="text-center text-gray-500 py-8">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No secondary images</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-200">
        <Button
          variant="secondary"
          onClick={onChangeMain}
        >
          ← Change Main Image
        </Button>
        
        <Button
          onClick={onConfirm}
          size="lg"
        >
          ✓ Looks Good, Continue →
        </Button>
      </div>

      {/* Info box */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-900">
          <strong>Note:</strong> The main image will be automatically optimized 
          to meet marketplace requirements. You cannot edit it to prevent 
          listing rejection.
        </p>
      </div>
    </div>
  );
}