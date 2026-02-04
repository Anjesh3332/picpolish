'use client';

import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

/**
 * Upload progress component
 * Shows current step and progress
 * 
 * @param {number} currentStep - Current step (0-4)
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} status - 'uploading' | 'processing' | 'completed' | 'error'
 * @param {string} message - Status message
 */
export default function UploadProgress({ 
  currentStep = 0,
  progress = 0,
  status = 'uploading',
  message = ''
}) {
  const steps = [
    { label: 'Upload', step: 0 },
    { label: 'Detect', step: 1 },
    { label: 'Process', step: 2 },
    { label: 'Export', step: 3 },
  ];

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
      {/* Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((stepObj, index) => {
          const isCompleted = currentStep > stepObj.step;
          const isCurrent = currentStep === stepObj.step;
          const isPending = currentStep < stepObj.step;

          return (
            <div key={stepObj.step} className="flex items-center flex-1">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
                    isCompleted && 'bg-green-100 text-green-600',
                    isCurrent && 'bg-primary-600 text-white',
                    isPending && 'bg-gray-100 text-gray-400'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    stepObj.step + 1
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs mt-2 font-medium',
                    (isCompleted || isCurrent) ? 'text-gray-900' : 'text-gray-400'
                  )}
                >
                  {stepObj.label}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-4">
                  <div
                    className={cn(
                      'h-full rounded transition-all',
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {message || 'Processing...'}
          </span>
          <span className="text-sm font-medium text-gray-700">
            {progress}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-300 rounded-full',
              status === 'error' ? 'bg-red-500' : 'bg-primary-600'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Status message */}
      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Processing failed. Please try again.</span>
        </div>
      )}

      {status === 'completed' && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          <span>Processing complete!</span>
        </div>
      )}
    </div>
  );
}