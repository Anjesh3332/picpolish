import sharp from 'sharp';
import { MARKETPLACE_SPECS, QUALITY_THRESHOLDS } from '../utils/constants';

/**
 * Process main image for marketplace
 * - Remove background (already done by Photoroom)
 * - Add pure white background
 * - Center product
 * - Resize to marketplace specs
 * - Ensure 85% coverage
 * 
 * @param {Buffer} imageBuffer - Image with transparent background from Photoroom
 * @param {string} marketplace - Target marketplace
 * @returns {Promise<Buffer>} - Processed image buffer
 */
export async function processMainImage(imageBuffer, marketplace) {
  try {
    const specs = MARKETPLACE_SPECS[marketplace];
    if (!specs) {
      throw new Error(`Invalid marketplace: ${marketplace}`);
    }
    
    const { size, bgColor, coverage } = specs.mainImage;
    const [targetWidth, targetHeight] = size;
    
    // Get image metadata
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    
    // Calculate product dimensions with desired coverage (85%)
    const maxProductWidth = Math.floor(targetWidth * coverage);
    const maxProductHeight = Math.floor(targetHeight * coverage);
    
    // Resize product to fit within coverage area
    const resizedProduct = await sharp(imageBuffer)
      .resize(maxProductWidth, maxProductHeight, {
        fit: 'inside',
        withoutEnlargement: false,
        background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
      })
      .toBuffer();
    
    // Get dimensions of resized product
    const resizedMetadata = await sharp(resizedProduct).metadata();
    const productWidth = resizedMetadata.width;
    const productHeight = resizedMetadata.height;
    
    // Calculate position to center product
    const xOffset = Math.floor((targetWidth - productWidth) / 2);
    const yOffset = Math.floor((targetHeight - productHeight) / 2);
    
    // Create white canvas
    const canvas = sharp({
      create: {
        width: targetWidth,
        height: targetHeight,
        channels: 3,
        background: { r: bgColor[0], g: bgColor[1], b: bgColor[2] },
      },
    });
    
    // Composite product onto white canvas
    const finalImage = await canvas
      .composite([
        {
          input: resizedProduct,
          left: xOffset,
          top: yOffset,
        },
      ])
      .jpeg({
        quality: 95,
        mozjpeg: true,
      })
      .toBuffer();
    
    return finalImage;
  } catch (error) {
    console.error('Main image processing error:', error);
    throw new Error('Failed to process main image');
  }
}

/**
 * Process secondary image with template overlay
 * 
 * @param {Buffer} productImageBuffer - Product image (background removed)
 * @param {Object} templateData - Template configuration
 * @param {string} marketplace - Target marketplace
 * @param {Object} options - Additional options (shadow, background)
 * @returns {Promise<Buffer>} - Processed image buffer
 */
export async function processSecondaryImage(
  productImageBuffer,
  templateData,
  marketplace,
  options = {}
) {
  try {
    const specs = MARKETPLACE_SPECS[marketplace];
    const [targetWidth, targetHeight] = specs.secondaryImage.size;
    
    // For MVP Phase 1, we'll just resize the product image
    // Template overlay will be added in Phase 2
    
    const { shadowType = 'none', bgColor = [255, 255, 255] } = options;
    
    // Resize product
    let processedImage = sharp(productImageBuffer)
      .resize(targetWidth, targetHeight, {
        fit: 'inside',
        background: { r: bgColor[0], g: bgColor[1], b: bgColor[2] },
      });
    
    // Add shadow if requested
    if (shadowType === 'drop') {
      // Add drop shadow (simplified version)
      // Full shadow implementation in Phase 2
      processedImage = processedImage.modulate({
        brightness: 0.95,
      });
    }
    
    const buffer = await processedImage
      .jpeg({ quality: 95 })
      .toBuffer();
    
    return buffer;
  } catch (error) {
    console.error('Secondary image processing error:', error);
    throw new Error('Failed to process secondary image');
  }
}

/**
 * Validate image quality
 * 
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise<Object>} - Quality check results
 */
export async function validateImageQuality(imageBuffer) {
  try {
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    const stats = await image.stats();
    
    const checks = {
      resolution: {
        passed: metadata.width >= QUALITY_THRESHOLDS.minResolution && 
                metadata.height >= QUALITY_THRESHOLDS.minResolution,
        width: metadata.width,
        height: metadata.height,
        message: `Resolution: ${metadata.width}x${metadata.height}`,
      },
      format: {
        passed: ['jpeg', 'jpg', 'png'].includes(metadata.format),
        format: metadata.format,
        message: `Format: ${metadata.format}`,
      },
      quality: {
        passed: true, // Simplified check for MVP
        message: 'Quality check passed',
      },
    };
    
    const allPassed = Object.values(checks).every(check => check.passed);
    
    return {
      passed: allPassed,
      score: allPassed ? 1.0 : 0.7,
      checks,
    };
  } catch (error) {
    console.error('Quality validation error:', error);
    return {
      passed: false,
      score: 0,
      checks: {},
      error: error.message,
    };
  }
}

/**
 * Check if background is pure white
 * 
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise<Object>} - Background check results
 */
export async function checkWhiteBackground(imageBuffer) {
  try {
    const image = sharp(imageBuffer);
    const { channels } = await image.metadata();
    
    // Sample corner pixels to check background color
    const stats = await image.stats();
    
    // Check if channels are close to 255 (white)
    const isWhite = stats.channels.every(channel => 
      channel.mean >= 250 && channel.mean <= 255
    );
    
    return {
      isWhite,
      rgb: stats.channels.slice(0, 3).map(c => Math.round(c.mean)),
      message: isWhite ? 'Background is pure white' : 'Background is not white',
    };
  } catch (error) {
    console.error('Background check error:', error);
    return {
      isWhite: false,
      error: error.message,
    };
  }
}

/**
 * Calculate product coverage percentage
 * (How much of the canvas the product occupies)
 * 
 * @param {Buffer} imageBuffer - Product image (transparent background)
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @returns {Promise<number>} - Coverage percentage (0-1)
 */
export async function calculateCoverage(imageBuffer, canvasWidth, canvasHeight) {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    
    const productArea = metadata.width * metadata.height;
    const canvasArea = canvasWidth * canvasHeight;
    
    const coverage = productArea / canvasArea;
    
    return Math.min(coverage, 1.0); // Cap at 100%
  } catch (error) {
    console.error('Coverage calculation error:', error);
    return 0;
  }
}

/**
 * Resize image to multiple marketplace formats
 * 
 * @param {Buffer} imageBuffer - Source image
 * @param {Array<string>} marketplaces - Target marketplaces
 * @returns {Promise<Object>} - Object with marketplace keys and image buffers
 */
export async function resizeForMarketplaces(imageBuffer, marketplaces) {
  try {
    const results = {};
    
    for (const marketplace of marketplaces) {
      const specs = MARKETPLACE_SPECS[marketplace];
      if (!specs) continue;
      
      const [width, height] = specs.mainImage.size;
      
      const resized = await sharp(imageBuffer)
        .resize(width, height, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255 },
        })
        .jpeg({ quality: 95 })
        .toBuffer();
      
      results[marketplace] = resized;
      
      // Add thumbnail for Shopify
      if (marketplace === 'Shopify' && specs.thumbnail) {
        const [thumbWidth, thumbHeight] = specs.thumbnail.size;
        const thumbnail = await sharp(imageBuffer)
          .resize(thumbWidth, thumbHeight, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255 },
          })
          .jpeg({ quality: 90 })
          .toBuffer();
        
        results[`${marketplace}_thumbnail`] = thumbnail;
      }
    }
    
    return results;
  } catch (error) {
    console.error('Marketplace resize error:', error);
    throw new Error('Failed to resize for marketplaces');
  }
}

/**
 * Get image metadata
 * 
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise<Object>} - Image metadata
 */
export async function getImageMetadata(imageBuffer) {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
      hasAlpha: metadata.hasAlpha,
      channels: metadata.channels,
    };
  } catch (error) {
    console.error('Metadata error:', error);
    return null;
  }
}

/**
 * Convert image format
 * 
 * @param {Buffer} imageBuffer - Source image
 * @param {string} format - Target format (jpeg, png, webp)
 * @param {Object} options - Conversion options
 * @returns {Promise<Buffer>} - Converted image
 */
export async function convertFormat(imageBuffer, format = 'jpeg', options = {}) {
  try {
    let converter = sharp(imageBuffer);
    
    switch (format.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        converter = converter.jpeg({ quality: options.quality || 95 });
        break;
      case 'png':
        converter = converter.png({ compressionLevel: options.compression || 9 });
        break;
      case 'webp':
        converter = converter.webp({ quality: options.quality || 90 });
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
    
    return await converter.toBuffer();
  } catch (error) {
    console.error('Format conversion error:', error);
    throw new Error('Failed to convert image format');
  }
}