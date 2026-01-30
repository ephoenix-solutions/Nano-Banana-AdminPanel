'use client';

import { useState, useRef, useEffect } from 'react';
import { Icons } from '@/config/icons';
import ImageCropper from './ImageCropper';
import { useToast } from './Toast';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onFileSelect?: (file: File | null) => void;
  folder?: string;
  label?: string;
  required?: boolean;
  optional?: boolean;
  enableCrop?: boolean;
  aspectRatio?: number;
  circularCrop?: boolean;
  showAspectRatioButtons?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  onFileSelect,
  folder = 'prompts',
  label = 'Upload Image',
  required = false,
  optional = false,
  enableCrop = false,
  aspectRatio,
  circularCrop = false,
  showAspectRatioButtons = true,
}: ImageUploadProps) {
  const [uploadMode, setUploadMode] = useState<'upload' | 'url'>('url');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // Update preview when value changes from parent
  useEffect(() => {
    if (value && value !== preview && !value.startsWith('__FILE_SELECTED__')) {
      setPreview(value);
    }
  }, [value]);

  const processFile = (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      showToast('Please select a valid image file (JPG, PNG, GIF, WebP, or SVG)', 'error');
      // Reset file input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be less than 5MB', 'error');
      // Reset file input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      
      if (enableCrop) {
        // Show cropper
        setImageToCrop(result);
        setShowCropper(true);
      } else {
        // Direct preview without cropping
        setSelectedFile(file);
        setPreview(result);
        
        // Notify parent about file selection
        if (onFileSelect) {
          onFileSelect(file);
        }
        
        // Set a placeholder value to indicate file is selected
        onChange(`__FILE_SELECTED__${file.name}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleCropComplete = (croppedBlob: Blob, croppedUrl: string) => {
    // Convert blob to file
    const originalFile = fileInputRef.current?.files?.[0];
    const fileName = originalFile?.name || 'cropped-image.jpg';
    const croppedFile = new File([croppedBlob], fileName, { type: 'image/jpeg' });

    setSelectedFile(croppedFile);
    setPreview(croppedUrl);
    setShowCropper(false);
    setImageToCrop(null);

    // Notify parent about file selection
    if (onFileSelect) {
      onFileSelect(croppedFile);
    }

    // Set a placeholder value to indicate file is selected
    onChange(`__FILE_SELECTED__${fileName}`);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageToCrop(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setSelectedFile(null);
    onChange('');
    if (onFileSelect) {
      onFileSelect(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Expose upload function
  const uploadFile = async (): Promise<string> => {
    if (!selectedFile) {
      throw new Error('No file selected');
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onChange(data.url);
        setPreview(data.url);
        setSelectedFile(null);
        return data.url;
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image');
      throw err;
    } finally {
      setUploading(false);
    }
  };

  // Store upload function reference
  useEffect(() => {
    if (selectedFile) {
      (window as any)[`uploadFile_${folder}_${Date.now()}`] = uploadFile;
    }
  }, [selectedFile]);

  const options = [
    { value: 'upload', label: 'Upload Image', icon: Icons.upload },
    { value: 'url', label: 'Direct URL', icon: Icons.link },
  ];

  return (
    <div>
      <label className="block text-sm font-semibold text-primary mb-2 font-body">
        {label}{' '}
        {required && <span className="text-secondary">*</span>}
        {optional && <span className="text-secondary/50">(Optional)</span>}
      </label>

      {/* Preview */}
      {preview && (
        <div className="relative w-full mb-3">
          <div className="relative flex items-center w-fit h-92 rounded-lg overflow-hidden border border-primary/10 bg-white">
            <img
              src={preview}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-background/40 text-primary rounded-lg hover:bg-background/90 transition-colors shadow-lg cursor-pointer"
              title="Remove image"
            >
              <Icons.close size={16} />
            </button>
          </div>
          {selectedFile && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-accent/10 border border-accent/20 rounded-lg">
              <Icons.info size={16} className="text-accent" />
              <p className="text-xs text-primary font-body">
                <strong>{selectedFile.name}</strong> • {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}
        </div>
      )}

      {/* Mode Toggle - Radio Style */}
      {!preview && (
        <ul className="items-center w-full text-sm font-medium text-primary bg-background border border-primary/10 rounded-lg sm:flex mb-3">
          {options.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <li
                key={option.value}
                className={`w-full ${
                  index < options.length - 1 ? 'border-b border-primary/10 sm:border-b-0 sm:border-r' : ''
                }`}
              >
                <div className="flex items-center ps-3">
                  <input
                    id={`upload-mode-${option.value}`}
                    type="radio"
                    value={option.value}
                    name="uploadMode"
                    checked={uploadMode === option.value}
                    // onChange={(e) => setUploadMode(e.target.value as 'upload' | 'url')}
                    onChange={(e) => {
                      const newMode = e.target.value as 'upload' | 'url';
                      if (newMode === 'upload') {
                        showToast('Upload service is currently unavailable. Please use Direct URL option.', 'warning');
                        return;
                      }
                      setUploadMode(newMode);
                    }}
                    className="w-4 h-4 border-2 border-primary/30 bg-white rounded-full appearance-none cursor-pointer checked:bg-accent checked:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all"
                  />
                  <label
                    htmlFor={`upload-mode-${option.value}`}
                    className="w-full py-3 select-none ms-2 text-sm font-medium text-primary cursor-pointer font-body flex items-center gap-2"
                  >
                    <IconComponent size={16} />
                    {option.label}
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Upload Section with Drag & Drop */}
      {!preview && uploadMode === 'upload' && (
        <div className="mb-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
            onChange={handleFileSelect}
            className="hidden"
            id={`file-upload-${folder}`}
            disabled={uploading}
          />
          <label
            htmlFor={`file-upload-${folder}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-3 w-full h-92 px-4 py-8 rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer ${
              isDragging
                ? 'border-accent bg-accent/10 scale-[1.02]'
                : 'border-primary/20 bg-background hover:bg-accent/5 hover:border-accent'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
                <span className="text-base font-medium text-primary font-body">Uploading...</span>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                  <Icons.upload size={32} className="text-accent" />
                </div>
                <div className="text-center">
                  <p className="text-base font-semibold text-primary font-body mb-1">
                    {enableCrop ? 'Choose Image to Crop & Rotate' : 'Choose Image from PC'}
                  </p>
                  <p className="text-sm text-secondary font-body">
                    or drag and drop here
                  </p>
                </div>
                <div className="px-4 py-2 bg-accent text-white rounded-lg font-medium text-sm">
                  Browse Files
                </div>
              </>
            )}
          </label>
          <p className="text-xs text-secondary/70 mt-2 font-body text-center">
            Max 5MB • Supported: JPG, PNG, GIF, WebP, SVG
            {enableCrop && ' • Crop & Rotate enabled'}
          </p>
        </div>
      )}

      {/* Direct URL Section */}
      {!preview && uploadMode === 'url' && (
        <div className="mb-3">
          <input
            type="url"
            value={value?.startsWith('__FILE_SELECTED__') ? '' : (value || '')}
            onChange={(e) => {
              onChange(e.target.value);
              setPreview(e.target.value);
              setSelectedFile(null);
              if (onFileSelect) {
                onFileSelect(null);
              }
            }}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
          <p className="text-xs text-secondary/70 mt-2 font-body">
            Paste the direct URL of your image
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-secondary/10 border border-secondary/20 rounded-lg mb-3">
          <Icons.alert size={16} className="text-secondary flex-shrink-0" />
          <p className="text-sm text-secondary font-body">{error}</p>
        </div>
      )}

      {/* Hidden input to store upload function reference */}
      <input
        type="hidden"
        data-upload-function={selectedFile ? 'true' : 'false'}
        data-folder={folder}
        ref={(el) => {
          if (el && selectedFile) {
            (el as any).uploadFile = uploadFile;
          }
        }}
      />

      {/* Image Cropper Modal */}
      {showCropper && imageToCrop && (
        <ImageCropper
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={aspectRatio}
          circularCrop={circularCrop}
          showAspectRatioButtons={showAspectRatioButtons}
        />
      )}
    </div>
  );
}
