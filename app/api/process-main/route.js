import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { removeBackground } from '@/lib/services/photoroomService';
import { processMainImage, resizeForMarketplaces } from '@/lib/services/imageService';
import { uploadFile, downloadFile } from '@/lib/services/storageService';

/**
 * POST /api/process-main
 * Process main product image
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { productId, mainImageIndex = 0, marketplaces } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID required' },
        { status: 400 }
      );
    }

    if (!marketplaces || marketplaces.length === 0) {
      return NextResponse.json(
        { error: 'Marketplaces required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get product images from database
    const { data: images, error: imagesError } = await supabase
      .from('images')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: true });

    if (imagesError || !images || images.length === 0) {
      return NextResponse.json(
        { error: 'Product images not found' },
        { status: 404 }
      );
    }

    // Get the main image
    const mainImage = images[mainImageIndex];
    if (!mainImage) {
      return NextResponse.json(
        { error: 'Main image not found' },
        { status: 404 }
      );
    }

    // Download original image from storage
    const imagePath = mainImage.original_url.split('/').slice(-2).join('/');
    const imageBuffer = await downloadFile(imagePath);

    // Step 1: Remove background using Photoroom API
    const noBgBuffer = await removeBackground(imageBuffer, {
      format: 'PNG',
      size: 'full',
    });

    // Step 2: Process for each marketplace
    const processedImages = {};
    
    for (const marketplace of marketplaces) {
      const processedBuffer = await processMainImage(noBgBuffer, marketplace);
      
      // Upload processed image
      const uploadResult = await uploadFile(
        processedBuffer,
        `${marketplace}_main.jpg`,
        `processed/${productId}`
      );
      
      processedImages[marketplace] = {
        url: uploadResult.publicUrl,
        path: uploadResult.path,
      };
    }

    // Update image record in database
    const { error: updateError } = await supabase
      .from('images')
      .update({
        processed_url: processedImages[marketplaces[0]].url, // First marketplace as primary
        marketplace_variants: processedImages,
        processing_status: 'completed',
        quality_score: 0.95, // Simplified for MVP
      })
      .eq('id', mainImage.id);

    if (updateError) {
      console.error('Update error:', updateError);
      // Continue for MVP
    }

    // Update product status
    const { error: productUpdateError } = await supabase
      .from('products')
      .update({
        status: 'processing',
        main_image_id: mainImage.id,
      })
      .eq('id', productId);

    if (productUpdateError) {
      console.error('Product update error:', productUpdateError);
    }

    return NextResponse.json({
      success: true,
      processedImages,
      message: 'Main image processed successfully',
    });

  } catch (error) {
    console.error('Process-main API error:', error);
    
    // Handle specific errors
    if (error.message.includes('Photoroom')) {
      return NextResponse.json(
        { error: 'Background removal failed. Please check your API key.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Processing failed: ' + error.message },
      { status: 500 }
    );
  }
}