'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/hooks/useAuth';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import MarketplaceSelector from '@/components/upload/MarketplaceSelector';
import FileDropzone from '@/components/upload/FileDropzone';
import ProductTree from '@/components/product/ProductTree';
import UploadProgress from '@/components/upload/UploadProgress';
import Loader from '@/components/common/Loader';

function UploadContent() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  
  // Workflow state
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMarketplaces, setSelectedMarketplaces] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [productData, setProductData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState(0);
  const [selectedBackground, setSelectedBackground] = useState('white');
const [selectedTemplates, setSelectedTemplates] = useState([]);


  // Check credits on mount
  useEffect(() => {
    if (profile) {
      if (profile.credits_remaining <= 0) {
        toast.error('No credits remaining. Please purchase more credits.');
        router.push('/pricing');
      }
    }
  }, [profile, router]);

  // Step 0: Marketplace Selection
  const handleMarketplacesContinue = (marketplaces) => {
    setSelectedMarketplaces(marketplaces);
    setCurrentStep(1);
  };

  // Step 1: Upload Files
  const handleFilesChange = (files) => {
    // Check if user has enough credits
    if (profile && files.length > profile.credits_remaining) {
      toast.error(`You only have ${profile.credits_remaining} credits remaining. Please purchase more.`);
      return;
    }
    setUploadedFiles(files);
  };

  const handleUploadContinue = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least 1 image');
      return;
    }

    // Check credits again before processing
    if (profile && uploadedFiles.length > profile.credits_remaining) {
      toast.error(`Insufficient credits. You need ${uploadedFiles.length} but have ${profile.credits_remaining}.`);
      router.push('/pricing');
      return;
    }

    setProcessing(true);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      uploadedFiles.forEach((fileObj) => {
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

      const organized = {
        name: 'Product',
        category: data.detectedCategory || 'Other',
        images: uploadedFiles,
        suggestedMainIndex: 0,
        uploadedUrls: data.uploadedUrls,
        productId: data.productId,
      };

      setProductData(organized);
      setCurrentStep(2);
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
    setCurrentStep(3);
    setProcessingStep(0);
    setUploadProgress(0);

    try {
      setProcessingStep(1);
      setUploadProgress(25);

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

      setProcessingStep(2);
      setUploadProgress(75);

      await new Promise(resolve => setTimeout(resolve, 2000));

      setProcessingStep(3);
      setUploadProgress(100);

      // Deduct credits after successful processing
      await refreshProfile();

      setTimeout(() => {
        router.push(`/export?productId=${productData.productId}`);
      }, 1000);

    } catch (error) {
      console.error('Processing error:', error);
      toast.error(error.message);
      setCurrentStep(2);
    }
  };

  const handleChangeMainImage = () => {
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
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{profile?.credits_remaining || 0}</span> credits
              </div>
              <div className="text-sm text-gray-600">
                Step {currentStep + 1} of 4
              </div>
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
              <p className="text-sm text-gray-500 mt-2">
                You have {profile?.credits_remaining || 0} credits remaining
              </p>
            </div>

            <FileDropzone
              files={uploadedFiles}
              onFilesChange={handleFilesChange}
              maxFiles={profile?.credits_remaining || 5}
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



{currentStep === 3 && (
  <BackgroundSelector
    onSelect={setSelectedBackground}
    onContinue={() => setCurrentStep(4)}
  />
)}

{currentStep === 4 && (
  <TemplateSelector
    imageCount={uploadedFiles.length}
    onSelect={setSelectedTemplates}
    onContinue={() => {
      // Process with templates
      handleProcessWithTemplates();
    }}
  />
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

export default function UploadPage() {
  return (
    <ProtectedRoute>
      <UploadContent />
    </ProtectedRoute>
  );
}