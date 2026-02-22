'use client';

import { useState } from 'react';
import { TEMPLATE_TYPES } from '@/lib/utils/constants';
import Button from '@/components/common/Button';
import { Plus } from 'lucide-react';

/**
 * Template type selector for secondary images
 */
export default function TemplateSelector({ imageCount, onSelect, onContinue }) {
  const [selectedTemplates, setSelectedTemplates] = useState([]);

  const handleToggle = (templateId) => {
    setSelectedTemplates(prev => {
      if (prev.includes(templateId)) {
        return prev.filter(id => id !== templateId);
      } else {
        if (prev.length >= imageCount - 1) {
          // Max templates = secondary images count
          return prev;
        }
        return [...prev, templateId];
      }
    });
  };

  const handleContinue = () => {
    onContinue(selectedTemplates);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Select Image Templates
        </h2>
        <p className="text-gray-600">
          Choose what to show in your secondary images (max {imageCount - 1})
        </p>
        <p className="text-sm text-gray-500 mt-2">
          {selectedTemplates.length} / {imageCount - 1} selected
        </p>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {Object.values(TEMPLATE_TYPES).map((template) => {
          const isSelected = selectedTemplates.includes(template.id);
          const isDisabled = !isSelected && selectedTemplates.length >= imageCount - 1;

          return (
            <button
              key={template.id}
              onClick={() => !isDisabled && handleToggle(template.id)}
              disabled={isDisabled}
              className={`
                relative p-6 rounded-xl border-2 transition-all text-center
                ${isSelected 
                  ? 'border-primary-600 bg-primary-50' 
                  : isDisabled
                    ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 hover:border-primary-300 hover:shadow-md'
                }
              `}
            >
              {/* Icon */}
              <div className="text-4xl mb-3">{template.icon}</div>
              
              {/* Name */}
              <h3 className="font-semibold text-gray-900 mb-2">
                {template.name}
              </h3>
              
              {/* Description */}
              <p className="text-xs text-gray-600">
                {template.description}
              </p>

              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white rotate-45" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <p className="text-sm text-blue-900">
          💡 <strong>Tip:</strong> Choose templates that showcase your product's unique features.
          Benefits, ingredients, and size charts perform best for conversions.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button variant="secondary">
          ← Back to Background
        </Button>
        <Button 
          onClick={handleContinue} 
          disabled={selectedTemplates.length === 0}
          size="lg"
        >
          Continue to Editor →
        </Button>
      </div>
    </div>
  );
}