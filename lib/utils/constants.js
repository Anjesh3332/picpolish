// Marketplace specifications and rules
export const MARKETPLACE_SPECS = {
  Amazon: {
    mainImage: {
      size: [2000, 2000],
      format: 'JPEG',
      bgColor: [255, 255, 255],
      coverage: 0.85,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    },
    secondaryImage: {
      size: [2000, 2000],
      format: 'JPEG',
      bgColor: [255, 255, 255],
      allowText: true,
      allowGraphics: true,
    },
    maxImages: 9,
    rules: {
      mainImagePureWhite: true,
      noTextOnMain: true,
      noLogosOnMain: true,
      noBordersOnMain: true,
      noWatermarksOnMain: true,
    },
  },
  Flipkart: {
    mainImage: {
      size: [2000, 2000],
      format: 'JPEG',
      bgColor: [255, 255, 255],
      coverage: 0.85,
      maxFileSize: 10 * 1024 * 1024,
    },
    secondaryImage: {
      size: [2000, 2000],
      format: 'JPEG',
      bgColor: [255, 255, 255],
      allowText: true,
      allowGraphics: true,
    },
    maxImages: 8,
    rules: {
      mainImagePureWhite: true,
      noTextOnMain: true,
      minimumDimension: 1000,
    },
  },
  Meesho: {
    mainImage: {
      size: [1600, 1600],
      format: 'JPEG',
      bgColor: [255, 255, 255],
      coverage: 0.80,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    },
    secondaryImage: {
      size: [1600, 1600],
      format: 'JPEG',
      bgColor: [255, 255, 255],
      allowText: true,
      allowGraphics: true,
    },
    maxImages: 5,
    rules: {
      mainImagePureWhite: true,
      minimumDimension: 500,
    },
  },
  Shopify: {
    mainImage: {
      size: [2048, 2048],
      format: 'JPEG',
      bgColor: [255, 255, 255],
      coverage: 0.85,
      maxFileSize: 20 * 1024 * 1024, // 20MB
    },
    secondaryImage: {
      size: [2048, 2048],
      format: 'JPEG',
      flexible: true, // More flexible with backgrounds
    },
    thumbnail: {
      size: [600, 600],
      format: 'JPEG',
    },
    maxImages: 250, // Shopify allows many images
    rules: {
      flexible: true, // Fewer restrictions than Amazon/Flipkart
    },
  },
};





// Background templates for secondary images
export const BACKGROUND_TEMPLATES = {
  WHITE: {
    id: 'white',
    name: 'Pure White',
    description: 'Clean white background (marketplace compliant)',
    color: '#FFFFFF',
    gradient: null,
    recommended: true,
  },
  GRADIENT_BLUE: {
    id: 'gradient_blue',
    name: 'Blue Gradient',
    description: 'Professional blue gradient',
    color: null,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    recommended: false,
  },
  GRADIENT_ORANGE: {
    id: 'gradient_orange',
    name: 'Orange Gradient',
    description: 'Warm orange gradient',
    color: null,
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    recommended: false,
  },
  GRADIENT_GREEN: {
    id: 'gradient_green',
    name: 'Green Gradient',
    description: 'Fresh green gradient',
    color: null,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    recommended: false,
  },
  SOLID_BLACK: {
    id: 'solid_black',
    name: 'Solid Black',
    description: 'Premium black background',
    color: '#000000',
    gradient: null,
    recommended: false,
  },
  SOLID_GRAY: {
    id: 'solid_gray',
    name: 'Solid Gray',
    description: 'Neutral gray background',
    color: '#F3F4F6',
    gradient: null,
    recommended: false,
  },
};

// Template types for secondary images
export const TEMPLATE_TYPES = {
  BENEFITS: {
    id: 'benefits',
    name: 'Benefits',
    icon: '✨',
    description: 'Highlight key product benefits',
  },
  INGREDIENTS: {
    id: 'ingredients',
    name: 'Ingredients',
    icon: '🌿',
    description: 'Show product ingredients/materials',
  },
  USAGE: {
    id: 'usage',
    name: 'How to Use',
    icon: '📋',
    description: 'Step-by-step usage instructions',
  },
  SIZE_CHART: {
    id: 'size_chart',
    name: 'Size Chart',
    icon: '📏',
    description: 'Size comparison chart',
  },
  CERTIFICATIONS: {
    id: 'certifications',
    name: 'Certifications',
    icon: '✓',
    description: 'Quality certifications & badges',
  },
  COMPARISON: {
    id: 'comparison',
    name: 'Comparison',
    icon: '⚖️',
    description: 'Compare with alternatives',
  },
  WHATS_IN_BOX: {
    id: 'whats_in_box',
    name: "What's in the Box",
    icon: '📦',
    description: 'Package contents',
  },
};









// Product categories with specific handling
export const PRODUCT_CATEGORIES = {
  Food: {
    label: 'Food & FMCG',
    templates: ['ingredients', 'nutritional', 'usage', 'certifications', 'size'],
    requiredInfo: ['net_weight', 'ingredients', 'expiry'],
  },
  Cosmetic: {
    label: 'Beauty & Skincare',
    templates: ['benefits', 'ingredients', 'usage', 'certifications'],
    requiredInfo: ['ingredients', 'benefits'],
  },
  Electronics: {
    label: 'Electronics',
    templates: ['features', 'specifications', 'whats_in_box', 'warranty'],
    requiredInfo: ['key_features', 'specifications'],
  },
  Apparel: {
    label: 'Fashion & Apparel',
    templates: ['material', 'size_guide', 'care', 'features'],
    requiredInfo: ['material', 'size'],
  },
  Other: {
    label: 'Other',
    templates: ['features', 'size', 'usage', 'whats_in_box'],
    requiredInfo: [],
  },
};

// // Template types for secondary images
// export const TEMPLATE_TYPES = {
//   benefits: {
//     label: 'Key Benefits',
//     description: 'Highlight 3-4 main features',
//     recommended: true,
//     maxBenefits: 4,
//     maxWordsPerBenefit: 15,
//   },
//   ingredients: {
//     label: 'Ingredients / Nutritional Info',
//     description: 'List key ingredients',
//     categories: ['Food', 'Cosmetic'],
//   },
//   usage: {
//     label: 'Usage Instructions',
//     description: 'Step-by-step guide',
//     maxSteps: 4,
//   },
//   size: {
//     label: 'Size / Net Quantity',
//     description: 'Dimensions & weight',
//   },
//   certifications: {
//     label: 'Certifications',
//     description: 'FSSAI, ISO, BIS badges',
//     categories: ['Food', 'Cosmetic'],
//   },
//   comparison: {
//     label: 'Why Choose Us',
//     description: 'Compare features',
//     maxComparisons: 4,
//   },
//   whats_in_box: {
//     label: "What's in the Box",
//     description: 'List all items included',
//   },
//   features: {
//     label: 'Key Features',
//     description: 'Technical specifications',
//     categories: ['Electronics'],
//   },
// };





// App configuration
export const APP_CONFIG = {
  FREE_TIER_LIMIT: 5, // 1 product = 5 images max
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/jpg', 'image/png'],
  ALLOWED_FILE_EXTENSIONS: ['.jpg', '.jpeg', '.png'],
  PROCESSING_TIMEOUT: 120000, // 2 minutes
  MAX_BATCH_SIZE: 50,
};

// Image quality thresholds
export const QUALITY_THRESHOLDS = {
  minResolution: 1000,
  minCoverage: 0.75,
  maxCoverage: 0.95,
  minReadabilityScore: 0.80,
  minBackgroundWhiteness: 0.95, // RGB closeness to (255,255,255)
};

// Processing status
export const PROCESSING_STATUS = {
  PENDING: 'pending',
  UPLOADING: 'uploading',
  DETECTING: 'detecting',
  PROCESSING_MAIN: 'processing_main',
  PROCESSING_SECONDARY: 'processing_secondary',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

// Error messages
export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'File size exceeds 10MB limit',
  INVALID_FILE_TYPE: 'Only JPG and PNG images are allowed',
  TOO_MANY_FILES: 'Maximum 5 images allowed in free tier',
  UPLOAD_FAILED: 'Upload failed. Please try again',
  PROCESSING_FAILED: 'Processing failed. Please contact support',
  INVALID_MARKETPLACE: 'Invalid marketplace selected',
  NO_PRODUCT_DETECTED: 'No product detected in image',
  LOW_QUALITY: 'Image quality too low for marketplace standards',
};

// Success messages
export const SUCCESS_MESSAGES = {
  UPLOAD_COMPLETE: 'Images uploaded successfully',
  PROCESSING_COMPLETE: 'Product processed successfully',
  EXPORT_READY: 'Your images are ready to download',
};