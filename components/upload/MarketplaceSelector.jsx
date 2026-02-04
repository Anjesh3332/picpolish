'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { MARKETPLACE_SPECS } from '@/lib/utils/constants';
import Button from '@/components/common/Button';
import { cn } from '@/lib/utils/helpers';

/**
 * Marketplace selector component
 * Allows users to select which marketplace(s) they're selling on
 * 
 * @param {Function} onContinue - Callback with selected marketplaces
 */
export default function MarketplaceSelector({ onContinue }) {
  const [selectedMarketplaces, setSelectedMarketplaces] = useState(['Amazon', 'Flipkart']);

  const toggleMarketplace = (marketplace) => {
    setSelectedMarketplaces(prev => {
      if (prev.includes(marketplace)) {
        return prev.filter(m => m !== marketplace);
      } else {
        return [...prev, marketplace];
      }
    });
  };

  const handleContinue = () => {
    if (selectedMarketplaces.length === 0) {
      return;
    }
    onContinue(selectedMarketplaces);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Where are you selling?
        </h2>
        <p className="text-gray-600">
          Select your marketplace(s) to optimize images accordingly
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {Object.entries(MARKETPLACE_SPECS).map(([marketplace, specs]) => {
          const isSelected = selectedMarketplaces.includes(marketplace);
          const { size, coverage } = specs.mainImage;

          return (
            <button
              key={marketplace}
              onClick={() => toggleMarketplace(marketplace)}
              className={cn(
                'w-full text-left p-5 rounded-xl border-2 transition-all',
                isSelected
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    'w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                    isSelected
                      ? 'bg-primary-600 border-primary-600'
                      : 'border-gray-300'
                  )}
                >
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {marketplace === 'Amazon' ? 'Amazon India' : marketplace}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    {size[0]}×{size[1]}px, {Math.round(coverage * 100)}% coverage, pure white BG
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {selectedMarketplaces.length} marketplace{selectedMarketplaces.length !== 1 ? 's' : ''} selected
        </p>
        <Button
          onClick={handleContinue}
          disabled={selectedMarketplaces.length === 0}
          size="lg"
        >
          Continue to Upload →
        </Button>
      </div>
    </div>
  );
}