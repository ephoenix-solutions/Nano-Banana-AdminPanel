import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3, getContentType, isValidImageFile, isValidFileSize } from '@/lib/utils/s3-upload';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'prompts';

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!isValidImageFile(file.name)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Only images are allowed (JPG, PNG, GIF, WebP, SVG).' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (!isValidFileSize(file.size, 5)) {
      return NextResponse.json(
        { success: false, message: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Convert to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get content type
    const contentType = getContentType(file.name);

    // Upload to S3
    const fileUrl = await uploadToS3(buffer, file.name, folder, contentType);

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      url: fileUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
