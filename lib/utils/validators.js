import Joi from 'joi';
import { APP_CONFIG, MARKETPLACE_SPECS } from './constants';

/**
 * Validate uploaded file
 */
export function validateFile(file) {
  const errors = [];
  
  // Check file type
  if (!APP_CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
    errors.push(`Invalid file type. Only ${APP_CONFIG.ALLOWED_FILE_EXTENSIONS.join(', ')} allowed`);
  }
  
  // Check file size
  if (file.size > APP_CONFIG.MAX_FILE_SIZE) {
    errors.push(`File size exceeds ${APP_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
  }
  
  // Check file name
  if (!file.name || file.name.trim() === '') {
    errors.push('File name is required');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate batch of files
 */
export function validateFilesBatch(files) {
  const errors = [];
  
  // Check total count
  if (files.length > APP_CONFIG.FREE_TIER_LIMIT) {
    errors.push(`Maximum ${APP_CONFIG.FREE_TIER_LIMIT} images allowed in free tier`);
  }
  
  if (files.length === 0) {
    errors.push('Please upload at least 1 image');
  }
  
  // Validate each file
  files.forEach((file, index) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      errors.push(`File ${index + 1} (${file.name}): ${validation.errors.join(', ')}`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate marketplace selection
 */
export function validateMarketplaces(marketplaces) {
  const schema = Joi.array()
    .items(Joi.string().valid(...Object.keys(MARKETPLACE_SPECS)))
    .min(1)
    .required();
  
  const { error } = schema.validate(marketplaces);
  
  if (error) {
    return {
      valid: false,
      errors: [error.details[0].message],
    };
  }
  
  return { valid: true, errors: [] };
}

/**
 * Validate product category
 */
export function validateCategory(category) {
  const validCategories = ['Food', 'Cosmetic', 'Electronics', 'Apparel', 'Other'];
  
  if (!category) {
    return {
      valid: false,
      errors: ['Category is required'],
    };
  }
  
  if (!validCategories.includes(category)) {
    return {
      valid: false,
      errors: ['Invalid category'],
    };
  }
  
  return { valid: true, errors: [] };
}

/**
 * Validate image dimensions
 */
export function validateImageDimensions(width, height, marketplace) {
  const specs = MARKETPLACE_SPECS[marketplace];
  const errors = [];
  
  if (!specs) {
    return {
      valid: false,
      errors: ['Invalid marketplace'],
    };
  }
  
  const minDim = specs.mainImage.size[0];
  
  if (width < minDim || height < minDim) {
    errors.push(`Image must be at least ${minDim}x${minDim}px for ${marketplace}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate template data
 */
export function validateTemplateData(templateType, data) {
  const errors = [];
  
  switch (templateType) {
    case 'benefits':
      if (!data.benefits || data.benefits.length === 0) {
        errors.push('At least one benefit is required');
      }
      if (data.benefits && data.benefits.length > 4) {
        errors.push('Maximum 4 benefits allowed');
      }
      data.benefits?.forEach((benefit, i) => {
        if (!benefit.text || benefit.text.trim() === '') {
          errors.push(`Benefit ${i + 1} text is required`);
        }
        if (benefit.text && benefit.text.split(' ').length > 15) {
          errors.push(`Benefit ${i + 1} exceeds 15 words limit`);
        }
      });
      break;
      
    case 'ingredients':
      if (!data.ingredients || data.ingredients.length === 0) {
        errors.push('At least one ingredient is required');
      }
      break;
      
    case 'usage':
      if (!data.steps || data.steps.length === 0) {
        errors.push('At least one step is required');
      }
      if (data.steps && data.steps.length > 4) {
        errors.push('Maximum 4 steps allowed');
      }
      break;
      
    default:
      break;
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate API request body
 */
export function validateUploadRequest(body) {
  const schema = Joi.object({
    marketplaces: Joi.array()
      .items(Joi.string().valid('Amazon', 'Flipkart', 'Meesho', 'Shopify'))
      .min(1)
      .required(),
    userId: Joi.string().optional(),
  });
  
  const { error, value } = schema.validate(body);
  
  if (error) {
    return {
      valid: false,
      errors: [error.details[0].message],
      data: null,
    };
  }
  
  return {
    valid: true,
    errors: [],
    data: value,
  };
}

/**
 * Validate email
 */
export function validateEmail(email) {
  const schema = Joi.string().email().required();
  const { error } = schema.validate(email);
  
  return {
    valid: !error,
    errors: error ? [error.details[0].message] : [],
  };
}

/**
 * Sanitize user input (prevent XSS)
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
}

/**
 * Validate product name
 */
export function validateProductName(name) {
  const errors = [];
  
  if (!name || name.trim() === '') {
    errors.push('Product name is required');
  }
  
  if (name && name.length > 100) {
    errors.push('Product name must be less than 100 characters');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}