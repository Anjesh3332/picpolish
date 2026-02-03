import axios from 'axios';
import FormData from 'form-data';

const PHOTOROOM_API_URL = 'https://sdk.photoroom.com/v1/segment';
const PHOTOROOM_API_KEY = process.env.PHOTOROOM_API_KEY;

/**
 * Remove background from image using Photoroom API
 * @param {Buffer|Blob} imageBuffer - Image file buffer
 * @param {Object} options - Processing options
 * @returns {Promise<Buffer>} - Processed image buffer
 */
export async function removeBackground(imageBuffer, options = {}) {
  try {
    const formData = new FormData();
    
    // Add image file
    formData.append('image_file', imageBuffer, {
      filename: options.filename || 'image.jpg',
      contentType: options.contentType || 'image/jpeg',
    });
    
    // Add processing parameters
    formData.append('format', options.format || 'PNG'); // PNG for transparency
    formData.append('size', options.size || 'full'); // full, preview, medium, hd
    formData.append('bg_color', options.bgColor || 'transparent');
    
    // Make API request
    const response = await axios.post(PHOTOROOM_API_URL, formData, {
      headers: {
        'x-api-key': PHOTOROOM_API_KEY,
        ...formData.getHeaders(),
      },
      responseType: 'arraybuffer', // Get binary data
      timeout: 30000, // 30 seconds timeout
    });
    
    return Buffer.from(response.data);
  } catch (error) {
    console.error('Photoroom API error:', error.response?.data || error.message);
    
    // Handle specific errors
    if (error.response?.status === 401) {
      throw new Error('Invalid Photoroom API key');
    }
    if (error.response?.status === 429) {
      throw new Error('Photoroom API rate limit exceeded');
    }
    if (error.response?.status === 400) {
      throw new Error('Invalid image format or corrupted file');
    }
    
    throw new Error('Background removal failed');
  }
}

/**
 * Batch process multiple images
 * @param {Array<Buffer>} images - Array of image buffers
 * @param {Object} options - Processing options
 * @returns {Promise<Array<Buffer>>} - Array of processed images
 */
export async function removeBackgroundBatch(images, options = {}) {
  try {
    // Process images sequentially to avoid rate limits
    const results = [];
    
    for (let i = 0; i < images.length; i++) {
      const processed = await removeBackground(images[i], {
        ...options,
        filename: `image_${i + 1}.jpg`,
      });
      results.push(processed);
      
      // Small delay between requests to avoid rate limiting
      if (i < images.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  } catch (error) {
    console.error('Batch processing error:', error);
    throw error;
  }
}

/**
 * Detect product category from image (using Photoroom's detection capabilities)
 * This is a simplified version - Photoroom doesn't have explicit category detection
 * We'll use the background removal response to infer product type
 * 
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise<string>} - Detected category
 */
export async function detectProductCategory(imageBuffer) {
  try {
    // For MVP, we'll use a simple heuristic
    // In production, you might want to use a separate vision API like Google Vision or AWS Rekognition
    
    // For now, return 'Other' and let user confirm/change
    // You can enhance this later with actual ML model
    return 'Other';
  } catch (error) {
    console.error('Category detection error:', error);
    return 'Other'; // Default fallback
  }
}

/**
 * Check Photoroom API health
 * @returns {Promise<boolean>} - API health status
 */
export async function checkApiHealth() {
  try {
    // Simple health check - try to process a small test image
    const testBuffer = Buffer.from('test');
    await removeBackground(testBuffer);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get Photoroom API usage/credits (if available in your plan)
 * Note: This depends on your Photoroom subscription tier
 */
export async function getApiUsage() {
  // Photoroom doesn't provide a usage endpoint in basic plans
  // You'll need to track usage in your own database
  return {
    used: 0,
    limit: null,
    resetDate: null,
  };
}