import { createAdminClient } from '../supabase/server';
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = 'product-images';

/**
 * Upload file to Supabase Storage
 * 
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - File name
 * @param {string} folder - Folder path (e.g., 'uploads', 'processed')
 * @returns {Promise<Object>} - Upload result with public URL
 */
export async function uploadFile(fileBuffer, fileName, folder = 'uploads') {
  try {
    const supabase = createAdminClient();
    
    // Generate unique file name
    const uniqueFileName = `${uuidv4()}_${fileName}`;
    const filePath = `${folder}/${uniqueFileName}`;
    
    // Upload file
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) {
      console.error('Upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
    
    return {
      path: data.path,
      publicUrl: urlData.publicUrl,
      fileName: uniqueFileName,
    };
  } catch (error) {
    console.error('Storage upload error:', error);
    throw error;
  }
}

/**
 * Upload multiple files
 * 
 * @param {Array<Object>} files - Array of { buffer, fileName }
 * @param {string} folder - Folder path
 * @returns {Promise<Array<Object>>} - Array of upload results
 */
export async function uploadMultipleFiles(files, folder = 'uploads') {
  try {
    const uploadPromises = files.map(({ buffer, fileName }) =>
      uploadFile(buffer, fileName, folder)
    );
    
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Multiple upload error:', error);
    throw error;
  }
}

/**
 * Download file from Supabase Storage
 * 
 * @param {string} filePath - File path in storage
 * @returns {Promise<Buffer>} - File buffer
 */
export async function downloadFile(filePath) {
  try {
    const supabase = createAdminClient();
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(filePath);
    
    if (error) {
      throw new Error(`Download failed: ${error.message}`);
    }
    
    // Convert blob to buffer
    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Storage download error:', error);
    throw error;
  }
}

/**
 * Delete file from storage
 * 
 * @param {string} filePath - File path
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteFile(filePath) {
  try {
    const supabase = createAdminClient();
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);
    
    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
    
    return true;
  } catch (error) {
    console.error('Storage delete error:', error);
    return false;
  }
}

/**
 * Delete multiple files
 * 
 * @param {Array<string>} filePaths - Array of file paths
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteMultipleFiles(filePaths) {
  try {
    const supabase = createAdminClient();
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(filePaths);
    
    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
    
    return true;
  } catch (error) {
    console.error('Multiple delete error:', error);
    return false;
  }
}

/**
 * Get signed URL for private file access
 * 
 * @param {string} filePath - File path
 * @param {number} expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns {Promise<string>} - Signed URL
 */
export async function getSignedUrl(filePath, expiresIn = 3600) {
  try {
    const supabase = createAdminClient();
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, expiresIn);
    
    if (error) {
      throw new Error(`Signed URL generation failed: ${error.message}`);
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error('Signed URL error:', error);
    throw error;
  }
}

/**
 * List files in a folder
 * 
 * @param {string} folder - Folder path
 * @returns {Promise<Array>} - List of files
 */
export async function listFiles(folder = '') {
  try {
    const supabase = createAdminClient();
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });
    
    if (error) {
      throw new Error(`List failed: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('List files error:', error);
    return [];
  }
}

/**
 * Create storage bucket if it doesn't exist
 * (Run this once during setup)
 */
export async function createBucket() {
  try {
    const supabase = createAdminClient();
    
    const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    });
    
    if (error && error.message !== 'Bucket already exists') {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Bucket creation error:', error);
    return false;
  }
}

/**
 * Get file size
 * 
 * @param {string} filePath - File path
 * @returns {Promise<number>} - File size in bytes
 */
export async function getFileSize(filePath) {
  try {
    const supabase = createAdminClient();
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', {
        search: filePath,
      });
    
    if (error || !data || data.length === 0) {
      return 0;
    }
    
    return data[0].metadata?.size || 0;
  } catch (error) {
    console.error('File size error:', error);
    return 0;
  }
}