import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createProductZip } from '@/lib/services/zipService';
import { downloadFile, uploadFile } from '@/lib/services/storageService';
import { calculateTimeSaved, calculateMoneySaved } from '@/lib/utils/helpers';

/**
 * POST /api/export
 * Create ZIP file with all processed images
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { productId } = body;

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
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get all processed images
    const { data: images, error: imagesError } = await supabase
      .from('images')
      .select('*')
      .eq('product_id', productId);

    if (imagesError || !images) {
      return NextResponse.json(
        { error: 'Images not found' },
        { status: 404 }
      );
    }

    // Download processed images from storage
    const processedImages = {};
    
    for (const marketplace of product.marketplaces) {
      const mainImage = images.find(img => img.type === 'main');
      
      if (mainImage && mainImage.marketplace_variants) {
        const variant = mainImage.marketplace_variants[marketplace];
        
        if (variant && variant.path) {
          const buffer = await downloadFile(variant.path);
          
          processedImages[marketplace] = {
            main: buffer,
            secondary: [], // Will be added in Phase 2
          };
        }
      }
    }

    // Create ZIP file
    const productData = {
      name: product.name,
      marketplaces: product.marketplaces,
      processedImages,
    };

    const zipBuffer = await createProductZip(productData, product.name);

    // Upload ZIP to storage
    const zipUpload = await uploadFile(
      zipBuffer,
      `${product.name}.zip`,
      `exports/${productId}`
    );

    // Calculate stats
    const totalImages = images.length;
    const timeSaved = calculateTimeSaved(totalImages);
    const moneySaved = calculateMoneySaved(totalImages);

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
        images_processed: totalImages,
        time_saved_seconds: totalImages * 420, // 7 minutes per image
        money_saved_inr: moneySaved,
        credits_used: totalImages,
      });

    if (historyError) {
      console.error('History creation error:', historyError);
    }

    return NextResponse.json({
      success: true,
      zipUrl: zipUpload.publicUrl,
      stats: {
        totalImages,
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