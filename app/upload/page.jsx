'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import MarketplaceSelector from '@/components/upload/MarketplaceSelector';
import FileDropzone from '@/components/upload/FileDropzone';
import ProductTree from '@/components/product/ProductTree';
import UploadProgress from '@/components/upload/UploadProgress';
import Loader from '@/components/common/Loader';

export default function UploadPage() {
  const router = useRouter();
  
  // Workflow state
  const [currentStep, setCurrentStep] = useState(0); // 0: marketplace, 1: upload, 2: confirm, 3: processing
  const [selectedMarketplaces, setSelectedMarketplaces] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [productData, setProductData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState(0);

  // Step 0: Marketplace Selection
  const handleMarketplacesContinue = (marketplaces) => {
    setSelectedMarketplaces(marketplaces);
    setCurrentStep(1);
  };

  // Step 1: Upload Files
  const handleFilesChange = (files) => {
    setUploadedFiles(files);
  };

  const handleUploadContinue = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least 1 image');
      return;
    }

    setProcessing(true);
    setUploadProgress(10);

    try {
      // Upload files to server
      const formData = new FormData();
      uploadedFiles.forEach((fileObj, index) => {
        formData.append('images', fileObj.file);
      });
      formData.append('marketplaces', JSON.stringify(selectedMarketplaces));

      setUploadProgress(30);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadProgress(100);

      // Organize product data
      const organized = {
        name: 'Product', // Will be auto-detected or user-provided later
        category: data.detectedCategory || 'Other',
        images: uploadedFiles,
        suggestedMainIndex: 0, // First image by default
        uploadedUrls: data.uploadedUrls,
        productId: data.productId,
      };

      setProductData(organized);
      setCurrentStep(2); // Move to confirmation step
      toast.success('Images uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message);
    } finally {
      setProcessing(false);
    }
  };

  // Step 2: Confirm Product Tree
  const handleConfirmProduct = async () => {
    setCurrentStep(3); // Move to processing
    setProcessingStep(0);
    setUploadProgress(0);

    try {
      // Start processing
      setProcessingStep(1); // Detecting
      setUploadProgress(25);

      // Call process API
      const response = await fetch('/api/process-main', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: productData.productId,
          mainImageIndex: productData.suggestedMainIndex,
          marketplaces: selectedMarketplaces,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Processing failed');
      }

      setProcessingStep(2); // Processing
      setUploadProgress(75);

      // Wait a bit for processing to complete
      await new Promise(resolve => setTimeout(resolve, 2000));

      setProcessingStep(3); // Export
      setUploadProgress(100);

      // Redirect to export page
      setTimeout(() => {
        router.push(`/export?productId=${productData.productId}`);
      }, 1000);

    } catch (error) {
      console.error('Processing error:', error);
      toast.error(error.message);
      setCurrentStep(2); // Go back to confirmation
    }
  };

  const handleChangeMainImage = () => {
    // For MVP, just show toast - full implementation in Phase 2
    toast('Main image selection will be available in the next update', {
      icon: '🔜',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              PicPolish
            </Link>
            <div className="text-sm text-gray-600">
              Step {currentStep + 1} of 4
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Step 0: Marketplace Selection */}
        {currentStep === 0 && (
          <div className="fade-in">
            <MarketplaceSelector onContinue={handleMarketplacesContinue} />
          </div>
        )}

        {/* Step 1: Upload Images */}
        {currentStep === 1 && (
          <div className="fade-in">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Upload Your Product Images
              </h2>
              <p className="text-gray-600">
                Selected marketplaces: {selectedMarketplaces.join(', ')}
              </p>
            </div>

            <FileDropzone
              files={uploadedFiles}
              onFilesChange={handleFilesChange}
            />

            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => setCurrentStep(0)}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Marketplaces
              </button>

              <button
                onClick={handleUploadContinue}
                disabled={uploadedFiles.length === 0 || processing}
                className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
              >
                {processing ? 'Uploading...' : 'Continue to Review →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Confirm Product Tree */}
        {currentStep === 2 && productData && (
          <div className="fade-in">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Review Your Product Images
              </h2>
              <p className="text-gray-600">
                Confirm the main image and organization
              </p>
            </div>

            <ProductTree
              productData={productData}
              onChangeMain={handleChangeMainImage}
              onConfirm={handleConfirmProduct}
            />
          </div>
        )}

        {/* Step 3: Processing */}
        {currentStep === 3 && (
          <div className="fade-in">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Processing Your Images
              </h2>
              <p className="text-gray-600">
                Please wait while we optimize your images for {selectedMarketplaces.join(', ')}
              </p>
            </div>

            <UploadProgress
              currentStep={processingStep}
              progress={uploadProgress}
              status="processing"
              message={
                processingStep === 0 ? 'Starting...' :
                processingStep === 1 ? 'Detecting product category...' :
                processingStep === 2 ? 'Processing images...' :
                'Finalizing export...'
              }
            />

            <div className="mt-8 text-center">
              <Loader size="md" text="This usually takes 30-60 seconds" />
            </div>
          </div>
        )}
      </main>

      {/* Processing overlay */}
      {processing && currentStep === 1 && (
        <Loader fullScreen text="Uploading images..." />
      )}
    </div>
  );
}