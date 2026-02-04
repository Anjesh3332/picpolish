'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, AlertCircle } from 'lucide-react';
import { validateFilesBatch } from '@/lib/utils/validators';
import { formatFileSize } from '@/lib/utils/helpers';
import { APP_CONFIG } from '@/lib/utils/constants';
import { cn } from '@/lib/utils/helpers';

/**
 * File dropzone component for uploading images
 * 
 * @param {Array} files - Current uploaded files
 * @param {Function} onFilesChange - Callback when files change
 * @param {number} maxFiles - Maximum number of files allowed
 */
export default function FileDropzone({ 
  files = [], 
  onFilesChange,
  maxFiles = APP_CONFIG.FREE_TIER_LIMIT 
}) {
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Validate files
    const validation = validateFilesBatch(acceptedFiles);
    
    if (!validation.valid) {
      alert(validation.errors.join('\n'));
      return;
    }
    
    // Check total count
    const totalFiles = files.length + acceptedFiles.length;
    if (totalFiles > maxFiles) {
      alert(`Maximum ${maxFiles} images allowed`);
      return;
    }
    
    // Add new files
    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substring(7),
    }));
    
    onFilesChange([...files, ...newFiles]);
  }, [files, maxFiles, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: APP_CONFIG.MAX_FILE_SIZE,
    multiple: true,
  });

  const removeFile = (id) => {
    const updatedFiles = files.filter(f => f.id !== id);
    onFilesChange(updatedFiles);
  };

  return (
    <div>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-3 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all',
          isDragActive
            ? 'border-primary-600 bg-primary-50'
            : 'border-gray-300 bg-white hover:border-primary-400 hover:bg-gray-50'
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <Upload className="w-10 h-10 text-primary-600" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {isDragActive ? 'Drop images here' : 'Drag & Drop Images Here'}
          </h3>
          
          <p className="text-gray-600 mb-4">or click to browse</p>
          
          <div className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg font-medium">
            Choose Files
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            Max {maxFiles} images • JPG, PNG • Max {APP_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB each
          </p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              Uploaded Images ({files.length}/{maxFiles})
            </h3>
            <button
              onClick={() => onFilesChange([])}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {files.map((fileObj) => (
              <div
                key={fileObj.id}
                className="relative group border-2 border-gray-200 rounded-lg overflow-hidden aspect-square"
              >
                <img
                  src={fileObj.preview}
                  alt={fileObj.file.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all">
                  <button
                    onClick={() => removeFile(fileObj.id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* File info */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-xs truncate opacity-0 group-hover:opacity-100 transition-opacity">
                  {fileObj.file.name}
                  <div className="text-gray-300">
                    {formatFileSize(fileObj.file.size)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      {files.length === 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Tips for best results:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>Use clear, well-lit product photos</li>
                <li>Avoid blurry or low-resolution images</li>
                <li>Include at least 1 main product image</li>
                <li>Maximum {maxFiles} images in free tier</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}