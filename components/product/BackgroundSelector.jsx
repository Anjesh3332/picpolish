'use client';

import { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { BACKGROUND_TEMPLATES } from '@/lib/utils/constants';
import Button from '@/components/common/Button';

/**
 * Background selector for secondary images
 */
export default function BackgroundSelector({ onSelect, onContinue }) {
  const [selectedBg, setSelectedBg] = useState('white');

  const handleSelect = (bgId) => {
    setSelectedBg(bgId);
    onSelect(bgId);
  };

  const handleContinue = () => {
    onContinue(selectedBg);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Choose Background Style
        </h2>
        <p className="text-gray-600">
          Select background for your secondary product images
        </p>
      </div>

      {/* Warning for non-white backgrounds */}
      {selectedBg !== 'white' && (
        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-900">
              <p className="font-medium mb-1">Note:</p>
              <p>
                Colored backgrounds can only be used for <strong>secondary images</strong>.
                Your main image will always have a pure white background for marketplace compliance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Background Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        {Object.values(BACKGROUND_TEMPLATES).map((bg) => (
          <button
            key={bg.id}
            onClick={() => handleSelect(bg.id)}
            className={`
              relative rounded-xl overflow-hidden border-2 transition-all
              ${selectedBg === bg.id 
                ? 'border-primary-600 shadow-lg scale-105' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            {/* Background Preview */}
            <div 
              className="aspect-square"
              style={{
                background: bg.gradient || bg.color,
              }}
            >
              {/* Sample Product Silhouette */}
              <div className="flex items-center justify-center h-full">
                <div className="w-24 h-24 bg-white/20 rounded-lg backdrop-blur-sm" />
              </div>
            </div>

            {/* Info */}
            <div className="p-4 bg-white">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900">{bg.name}</h3>
                {bg.recommended && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                    Recommended
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600">{bg.description}</p>
            </div>

            {/* Selected Check */}
            {selectedBg === bg.id && (
              <div className="absolute top-3 right-3 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Shadow/Reflection Options */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h3 className="font-semibold text-gray-900 mb-4">Shadow & Effects</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-300">
            <input
              type="radio"
              name="shadow"
              defaultChecked
              className="mt-1"
            />
            <div>
              <p className="font-medium text-gray-900">No Shadow</p>
              <p className="text-sm text-gray-600">Clean and simple</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-300">
            <input
              type="radio"
              name="shadow"
              className="mt-1"
            />
            <div>
              <p className="font-medium text-gray-900">Soft Shadow</p>
              <p className="text-sm text-gray-600">Subtle depth</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-300">
            <input
              type="radio"
              name="shadow"
              className="mt-1"
            />
            <div>
              <p className="font-medium text-gray-900">Reflection</p>
              <p className="text-sm text-gray-600">Premium look</p>
            </div>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button variant="secondary">
          ← Back
        </Button>
        <Button onClick={handleContinue} size="lg">
          Continue to Templates →
        </Button>
      </div>
    </div>
  );
}