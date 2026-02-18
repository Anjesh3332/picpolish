import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createProductZip } from '@/lib/services/zipService';
import { uploadFile } from '@/lib/services/storageService';
import { calculateTimeSaved, calculateMoneySaved } from '@/lib/utils/helpers';
import axios from 'axios';

/**
 * POST /api/export
 * Create ZIP file with all processed images
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { productId } = body;

    console.log('Creating export for product:', productId);

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get product data
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      console.error('Product not found:', productError);
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    console.log('Product found:', product.name);

    // Get all processed images
    const { data: images, error: imagesError } = await supabase
      .from('images')
      .select('*')
      .eq('product_id', productId);

    if (imagesError || !images) {
      console.error('Images not found:', imagesError);
      return NextResponse.json(
        { error: 'Images not found' },
        { status: 404 }
      );
    }

    console.log('Found images:', images.length);

    // Download processed images from storage
    const processedImages = {};
    
    for (const marketplace of product.marketplaces) {
      console.log('Processing marketplace:', marketplace);
      
      const mainImage = images.find(img => img.type === 'main');
      
      if (mainImage && mainImage.marketplace_variants) {
        const variant = mainImage.marketplace_variants[marketplace];
        
        if (variant && variant.url) {
          console.log('Downloading from:', variant.url);
          
          // Download the processed image via public URL
          const response = await axios.get(variant.url, {
            responseType: 'arraybuffer',
            timeout: 30000,
          });
          
          const buffer = Buffer.from(response.data);
          console.log('Downloaded', marketplace, 'image, size:', buffer.length);
          
          processedImages[marketplace] = {
            main: buffer,
            secondary: [], // Will be added in Phase 2
          };
        } else {
          console.warn('No variant found for', marketplace);
        }
      }
    }

    if (Object.keys(processedImages).length === 0) {
      return NextResponse.json(
        { error: 'No processed images found' },
        { status: 404 }
      );
    }

    console.log('Creating ZIP with', Object.keys(processedImages).length, 'marketplaces');

    // Create ZIP file
    const productData = {
      name: product.name,
      marketplaces: product.marketplaces,
      processedImages,
    };

    const zipBuffer = await createProductZip(productData, product.name);
    console.log('ZIP created, size:', zipBuffer.length);

    // Upload ZIP to storage
    const zipUpload = await uploadFile(
      zipBuffer,
      `${product.name}.zip`,
      `exports/${productId}`
    );

    console.log('ZIP uploaded to:', zipUpload.publicUrl);

    // Calculate stats
    const totalImages = images.length * product.marketplaces.length; // Each image x marketplaces
    const timeSaved = calculateTimeSaved(images.length);
    const moneySaved = calculateMoneySaved(images.length);

    // Update product with ZIP URL and completion status
    const { error: updateError } = await supabase
      .from('products')
      .update({
        status: 'completed',
        zip_url: zipUpload.publicUrl,
        completed_at: new Date().toISOString(),
        health_score: 92, // Simplified for MVP
      })
      .eq('id', productId);

    if (updateError) {
      console.error('Product update error:', updateError);
    }

    // Create processing history record
    const { error: historyError } = await supabase
      .from('processing_history')
      .insert({
        user_id: product.user_id,
        product_id: productId,
        images_processed: images.length,
        time_saved_seconds: images.length * 420, // 7 minutes per image
        money_saved_inr: moneySaved,
        credits_used: images.length,
      });

    if (historyError) {
      console.error('History creation error:', historyError);
    }

    console.log('Export complete!');

    return NextResponse.json({
      success: true,
      zipUrl: zipUpload.publicUrl,
      stats: {
        totalImages: images.length,
        timeSaved,
        moneySaved,
      },
      message: 'Export created successfully',
    });

  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json(
      { error: 'Export failed: ' + error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/export?productId=xxx
 * Get export status and download URL
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        status: product.status,
        zipUrl: product.zip_url,
        healthScore: product.health_score,
        totalImages: product.total_images,
        marketplaces: product.marketplaces,
      },
    });

  } catch (error) {
    console.error('Export GET error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}