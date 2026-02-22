// import { NextResponse } from 'next/server';
// import { v4 as uuidv4 } from 'uuid';
// import { createClient } from '@/lib/supabase/server';
// import { uploadMultipleFiles } from '@/lib/services/storageService';
// import { validateUploadRequest } from '@/lib/utils/validators';

// /**
//  * POST /api/upload
//  * Upload product images (with authentication)
//  */
// export async function POST(request) {
//   try {
//     const formData = await request.formData();
//     const images = formData.getAll('images');
//     const marketplacesStr = formData.get('marketplaces');

//     // Validate
//     if (!images || images.length === 0) {
//       return NextResponse.json(
//         { error: 'No images provided' },
//         { status: 400 }
//       );
//     }

//     if (!marketplacesStr) {
//       return NextResponse.json(
//         { error: 'Marketplaces not specified' },
//         { status: 400 }
//       );
//     }

//     const marketplaces = JSON.parse(marketplacesStr);
//     const validation = validateUploadRequest({ marketplaces });

//     if (!validation.valid) {
//       return NextResponse.json(
//         { error: validation.errors[0] },
//         { status: 400 }
//       );
//     }

//     // Get Supabase client
//     const supabase = await createClient();

//     // Get authenticated user
//     const { data: { user }, error: userError } = await supabase.auth.getUser();
    
//     if (userError || !user) {
//       return NextResponse.json(
//         { error: 'Unauthorized. Please login.' },
//         { status: 401 }
//       );
//     }

//     console.log('User authenticated:', user.id);

//     // Check user credits - use maybeSingle() instead of single()
//     const { data: profile, error: profileError } = await supabase
//       .from('users')
//       .select('credits_remaining')
//       .eq('id', user.id)
//       .maybeSingle();

//     console.log('Profile query result:', { profile, profileError });

//     // If profile doesn't exist
//     if (!profile) {
//       console.error('Profile not found for user:', user.id);
//       return NextResponse.json(
//         { error: 'User profile not found. Please sign out and sign in again.' },
//         { status: 404 }
//       );
//     }

//     // Check credits
//     if (profile.credits_remaining < images.length) {
//       return NextResponse.json(
//         { error: `Insufficient credits. You have ${profile.credits_remaining} but need ${images.length}.` },
//         { status: 403 }
//       );
//     }

//     console.log('Credits check passed:', profile.credits_remaining);

//     // Create product record
//     const productId = uuidv4();
//     const productName = `Product_${Date.now()}`;

//     const { error: productError } = await supabase
//       .from('products')
//       .insert({
//         id: productId,
//         user_id: user.id,
//         name: productName,
//         category: 'Other',
//         marketplaces: marketplaces,
//         status: 'pending',
//         total_images: images.length,
//       });

//     if (productError) {
//       console.error('Product creation error:', productError);
//       return NextResponse.json(
//         { error: 'Failed to create product' },
//         { status: 500 }
//       );
//     }

//     // Convert images to buffers and upload
//     const fileUploads = await Promise.all(
//       images.map(async (image, index) => {
//         const arrayBuffer = await image.arrayBuffer();
//         const buffer = Buffer.from(arrayBuffer);
        
//         return {
//           buffer,
//           fileName: `${productId}_${index}_${image.name}`,
//         };
//       })
//     );

//     // Upload to Supabase Storage
//     const uploadResults = await uploadMultipleFiles(
//       fileUploads,
//       `uploads/${productId}`
//     );

//     // Create image records in database
//     const imageRecords = uploadResults.map((result, index) => ({
//       id: uuidv4(),
//       product_id: productId,
//       type: index === 0 ? 'main' : 'secondary',
//       original_url: result.publicUrl,
//       processing_status: 'pending',
//     }));

//     const { error: imagesError } = await supabase
//       .from('images')
//       .insert(imageRecords);

//     if (imagesError) {
//       console.error('Images creation error:', imagesError);
//     }

//     console.log('Upload successful!');

//     return NextResponse.json({
//       success: true,
//       productId,
//       uploadedUrls: uploadResults.map(r => r.publicUrl),
//       detectedCategory: 'Other',
//       message: 'Images uploaded successfully',
//     });

//   } catch (error) {
//     console.error('Upload API error:', error);
//     return NextResponse.json(
//       { error: 'Upload failed: ' + error.message },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { uploadMultipleFiles } from '@/lib/services/storageService';
import { validateUploadRequest } from '@/lib/utils/validators';

/**
 * POST /api/upload
 * Upload product images (AUTH SAFE VERSION)
 */
export async function POST(request) {
  try {
    const formData = await request.formData();
    const images = formData.getAll('images');
    const marketplacesStr = formData.get('marketplaces');

    // ---------- VALIDATION ----------
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

    // ---------- SUPABASE AUTH SAFE CLIENT ----------
    const cookieStore = cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set() {},
          remove() {},
        },
      }
    );

    // ---------- AUTH CHECK ----------
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Auth error:', userError);
      return NextResponse.json(
        { error: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }

    console.log('User authenticated:', user.id);

    // ---------- PROFILE CHECK ----------
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('credits_remaining')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile) {
      console.error('Profile error:', profileError);
      return NextResponse.json(
        { error: 'User profile not found.' },
        { status: 404 }
      );
    }

    if (profile.credits_remaining < images.length) {
      return NextResponse.json(
        {
          error: `Insufficient credits. You have ${profile.credits_remaining} but need ${images.length}.`,
        },
        { status: 403 }
      );
    }

    console.log('Credits check passed:', profile.credits_remaining);

    // ---------- CREATE PRODUCT ----------
    const productId = uuidv4();
    const productName = `Product_${Date.now()}`;

    const { error: productError } = await supabase
      .from('products')
      .insert({
        id: productId,
        user_id: user.id,
        name: productName,
        category: 'Other',
        marketplaces,
        status: 'pending',
        total_images: images.length,
      });

    if (productError) {
      console.error('Product creation error:', productError);
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      );
    }

    // ---------- FILE PROCESSING ----------
    const fileUploads = await Promise.all(
      images.map(async (image, index) => {
        const buffer = Buffer.from(await image.arrayBuffer());

        return {
          buffer,
          fileName: `${productId}_${index}_${image.name}`,
        };
      })
    );

    const uploadResults = await uploadMultipleFiles(
      fileUploads,
      `uploads/${productId}`
    );

    // ---------- IMAGE RECORDS ----------
    const imageRecords = uploadResults.map((result, index) => ({
      id: uuidv4(),
      product_id: productId,
      type: index === 0 ? 'main' : 'secondary',
      original_url: result.publicUrl,
      processing_status: 'pending',
    }));

    await supabase.from('images').insert(imageRecords);

    console.log('Upload successful');

    return NextResponse.json({
      success: true,
      productId,
      uploadedUrls: uploadResults.map(r => r.publicUrl),
      detectedCategory: 'Other',
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