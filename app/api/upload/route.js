import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/lib/supabase/server';
import { uploadMultipleFiles } from '@/lib/services/storageService';
import { validateUploadRequest } from '@/lib/utils/validators';

/**
 * POST /api/upload
 * Upload product images
 */
export async function POST(request) {
  try {
    const formData = await request.formData();
    const images = formData.getAll('images');
    const marketplacesStr = formData.get('marketplaces');

    // Validate
    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    if (!marketplacesStr) {
      return NextResponse.json(
        { error: 'Marketplaces not specified' },
        { status: 400 }
      );
    }

    const marketplaces = JSON.parse(marketplacesStr);
    const validation = validateUploadRequest({ marketplaces });

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors[0] },
        { status: 400 }
      );
    }

    // Get Supabase client
    const supabase = await createClient();

    // Get or create user (for MVP, we'll skip auth and use anonymous user)
    // In production, get from session: const { data: { user } } = await supabase.auth.getUser();
    const userId = 'anonymous'; // Placeholder for MVP

    // Create product record
    const productId = uuidv4();
    const productName = `Product_${Date.now()}`;

    const { error: productError } = await supabase
      .from('products')
      .insert({
        id: productId,
        user_id: userId,
        name: productName,
        category: 'Other', // Will be detected later
        marketplaces: marketplaces,
        status: 'pending',
        total_images: images.length,
      });

    if (productError) {
      console.error('Product creation error:', productError);
      // For MVP, continue even if DB insert fails
    }

    // Convert images to buffers and upload
    const fileUploads = await Promise.all(
      images.map(async (image, index) => {
        const arrayBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        return {
          buffer,
          fileName: `${productId}_${index}_${image.name}`,
        };
      })
    );

    // Upload to Supabase Storage
    const uploadResults = await uploadMultipleFiles(
      fileUploads,
      `uploads/${productId}`
    );

    // Create image records in database
    const imageRecords = uploadResults.map((result, index) => ({
      id: uuidv4(),
      product_id: productId,
      type: index === 0 ? 'main' : 'secondary',
      original_url: result.publicUrl,
      processing_status: 'pending',
    }));

    const { error: imagesError } = await supabase
      .from('images')
      .insert(imageRecords);

    if (imagesError) {
      console.error('Images creation error:', imagesError);
      // Continue for MVP
    }

    // Return success
    return NextResponse.json({
      success: true,
      productId,
      uploadedUrls: uploadResults.map(r => r.publicUrl),
      detectedCategory: 'Other', // Will implement actual detection in Phase 2
      message: 'Images uploaded successfully',
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'Upload failed: ' + error.message },
      { status: 500 }
    );
  }
}