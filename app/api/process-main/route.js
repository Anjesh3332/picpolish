import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { removeBackground } from '@/lib/services/photoroomService';
import { processMainImage } from '@/lib/services/imageService';
import { uploadFile } from '@/lib/services/storageService';
import axios from 'axios';

/**
 * POST /api/process-main
 * Process main product image - SIMPLIFIED VERSION
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { productId, mainImageIndex = 0, marketplaces } = body;

    console.log('Processing request:', { productId, mainImageIndex, marketplaces });

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

    console.log('Found images:', images?.length);

    if (imagesError || !images || images.length === 0) {
      console.error('Images query error:', imagesError);
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

    console.log('Main image URL:', mainImage.original_url);

    // Download image directly from the public URL
    const imageResponse = await axios.get(mainImage.original_url, {
      responseType: 'arraybuffer',
      timeout: 30000,
    });
    const imageBuffer = Buffer.from(imageResponse.data);
    console.log('Image downloaded, size:', imageBuffer.length);

    // Step 1: Remove background using Photoroom API
    console.log('Removing background...');
    const noBgBuffer = await removeBackground(imageBuffer, {
      format: 'PNG',
      size: 'full',
    });
    console.log('Background removed');

    // Step 2: Process for each marketplace
    const processedImages = {};
    
    for (const marketplace of marketplaces) {
      console.log('Processing for', marketplace);
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
      
      console.log('Uploaded', marketplace, 'image');
    }

    // Update image record in database
    const { error: updateError } = await supabase
      .from('images')
      .update({
        processed_url: processedImages[marketplaces[0]].url,
        marketplace_variants: processedImages,
        processing_status: 'completed',
        quality_score: 0.95,
      })
      .eq('id', mainImage.id);

    if (updateError) {
      console.error('Update error:', updateError);
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

    console.log('Processing complete');

    return NextResponse.json({
      success: true,
      processedImages,
      message: 'Main image processed successfully',
    });

  } catch (error) {
    console.error('Process-main API error:', error);
    
    // Handle specific errors
    if (error.message && error.message.includes('Photoroom')) {
      return NextResponse.json(
        { error: 'Background removal failed. Check your Photoroom API key.' },
        { status: 500 }
      );
    }

    if (error.response) {
      console.error('HTTP error:', error.response.status, error.response.data);
    }

    return NextResponse.json(
      { error: 'Processing failed: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}