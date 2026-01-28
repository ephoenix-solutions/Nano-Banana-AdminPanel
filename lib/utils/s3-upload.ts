import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;
const S3_BASE_URL = process.env.NEXT_PUBLIC_S3_BASE_URL || 
  `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;

/**
 * Upload file to S3
 */
export async function uploadToS3(
  file: Buffer,
  fileName: string,
  folder: string = 'prompts',
  contentType: string = 'image/jpeg'
): Promise<string> {
  try {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${folder}/${timestamp}-${sanitizedFileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    await s3Client.send(command);
    return `${S3_BASE_URL}/${key}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload file to S3');
  }
}

/**
 * Delete file from S3
 */
export async function deleteFromS3(fileUrl: string): Promise<void> {
  try {
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1);

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    console.log('File deleted from S3:', key);
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw new Error('Failed to delete file from S3');
  }
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

/**
 * Get content type from extension
 */
export function getContentType(filename: string): string {
  const ext = getFileExtension(filename).toLowerCase();
  const contentTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
  };
  return contentTypes[ext] || 'application/octet-stream';
}

/**
 * Validate image file
 */
export function isValidImageFile(filename: string): boolean {
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const ext = getFileExtension(filename).toLowerCase();
  return validExtensions.includes(ext);
}

/**
 * Validate file size
 */
export function isValidFileSize(size: number, maxSizeMB: number = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return size <= maxSizeBytes;
}
