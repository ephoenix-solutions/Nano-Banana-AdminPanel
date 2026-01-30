'use client';

import { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { Icons } from '@/config/icons';

interface Point {
  x: number;
  y: number;
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImageBlob: Blob, croppedImageUrl: string) => void;
  onCancel: () => void;
  aspectRatio?: number;
  circularCrop?: boolean;
  showAspectRatioButtons?: boolean;
}

const ASPECT_RATIOS = [
  // Portrait
  { label: '9:16', value: 9 / 16 },
  { label: '2:3', value: 2 / 3 },
  { label: '4:5', value: 4 / 5 },

  // Square
  { label: '1:1', value: 1 },

  // Landscape
  { label: '5:4', value: 5 / 4 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:2', value: 3 / 2 },
  { label: '16:9', value: 16 / 9 },
  { label: '21:9', value: 21 / 9 },
];


export default function ImageCropper({
  imageSrc,
  onCropComplete,
  onCancel,
  aspectRatio: initialAspectRatio,
  circularCrop = false,
  showAspectRatioButtons = true,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(initialAspectRatio);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'crop' | 'rotate'>('crop');

  const onCropCompleteCallback = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getRadianAngle = (degreeValue: number) => {
    return (degreeValue * Math.PI) / 180;
  };

  const rotateSize = (width: number, height: number, rotation: number) => {
    const rotRad = getRadianAngle(rotation);
    return {
      width:
        Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
      height:
        Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    };
  };

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0
  ): Promise<{ blob: Blob; url: string }> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const rotRad = getRadianAngle(rotation);

    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
      image.width,
      image.height,
      rotation
    );

    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.translate(-image.width / 2, -image.height / 2);

    ctx.drawImage(image, 0, 0);

    const data = ctx.getImageData(
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height
    );

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(data, 0, 0);

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          const url = URL.createObjectURL(blob);
          resolve({ blob, url });
        },
        'image/jpeg',
        0.95
      );
    });
  };

  const handleCropComplete = async () => {
    if (!croppedAreaPixels) {
      return;
    }

    setProcessing(true);
    try {
      const { blob, url } = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation
      );
      onCropComplete(blob, url);
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to crop image. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90) % 360);
  };

  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleResetRotation = () => {
    setRotation(0);
  };

  const handleResetAspectRatio = () => {
    setAspectRatio(initialAspectRatio);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-primary/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-primary/10">
          <h2 className="text-xl font-bold text-primary font-heading">
            Crop & Rotate Image
          </h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background transition-colors"
          >
            <Icons.close size={20} className="text-primary" />
          </button>
        </div>

        {/* Crop Area */}
          <div className="relative flex-1 bg-white overflow-hidden">
            <div className="w-full h-full min-h-[550px]">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={aspectRatio}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropCompleteCallback}
                cropShape={circularCrop ? 'round' : 'rect'}
                showGrid={true}
                objectFit="contain"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-primary/10">
            <div className="flex border-b border-primary/10">
              <button
                type="button"
                onClick={() => setActiveTab('crop')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'crop'
                  ? 'text-accent border-b-2 border-accent bg-accent/5'
                  : 'text-secondary hover:text-primary hover:bg-primary/5'
                  }`}
              >
                Crop
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('rotate')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'rotate'
                  ? 'text-accent border-b-2 border-accent bg-accent/5'
                  : 'text-secondary hover:text-primary hover:bg-primary/5'
                  }`}
              >
                Rotate
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="px-6 py-4 min-h-[200px] space-y-4">
            {/* Crop Tab */}
            {activeTab === 'crop' && (
              <>
                {/* Aspect Ratio Selection */}
                {showAspectRatioButtons && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-primary font-body">
                        Aspect Ratio
                      </label>
                      <button
                        type="button"
                        onClick={handleResetAspectRatio}
                        disabled={processing || aspectRatio === initialAspectRatio}
                        className="px-3 py-1 text-xs font-medium text-primary border border-primary/10 rounded-lg hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-body"
                        title="Reset to Default"
                      >
                        Reset
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ASPECT_RATIOS.map((ratio) => (
                        <button
                          type="button"
                          key={ratio.label}
                          onClick={() => setAspectRatio(ratio.value)}
                          disabled={processing}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all border disabled:opacity-50 disabled:cursor-not-allowed font-body ${aspectRatio === ratio.value
                            ? 'bg-accent text-white border-accent'
                            : 'text-primary border-primary/10 hover:bg-primary/5'
                            }`}
                        >
                          {ratio.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Zoom Control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-primary font-body">
                      Zoom
                    </label>
                    <span className="text-sm text-secondary/70 font-body">
                      {Math.round(zoom * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full h-2 bg-primary/10 rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                </div>
              </>
            )}

            {/* Rotate Tab */}
            {activeTab === 'rotate' && (
              <>
                {/* Rotation Controls */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-primary font-body">
                    Rotation
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRotateLeft}
                      disabled={processing}
                      className="flex-1 px-4 py-2 text-sm font-medium text-primary border border-primary/10 rounded-lg hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-body flex items-center justify-center"
                      title="Rotate Left 90°"
                    >
                      <Icons.rotateCcw size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={handleResetRotation}
                      disabled={processing || rotation === 0}
                      className="px-4 py-2 text-sm font-medium text-primary border border-primary/10 rounded-lg hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-body"
                      title="Reset Rotation"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={handleRotateRight}
                      disabled={processing}
                      className="flex-1 px-4 py-2 text-sm font-medium text-primary border border-primary/10 rounded-lg hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-body flex items-center justify-center"
                      title="Rotate Right 90°"
                    >
                      <Icons.rotateCw size={20} />
                    </button>
                  </div>
                  <div className="text-center">
                    <span className="text-sm text-secondary/70 font-body">
                      {rotation}°
                    </span>
                  </div>
                </div>

                {/* Fine Rotation Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-primary font-body">
                      Fine Tune Rotation
                    </label>
                    <span className="text-sm text-secondary/70 font-body">
                      {rotation}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={1}
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-full h-2 bg-primary/10 rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-primary/10 bg-background/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-secondary font-body">
                {aspectRatio
                  ? `Aspect Ratio: ${aspectRatio.toFixed(2)}:1`
                  : 'Using default aspect ratio'}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={processing}
                  className="px-4 py-2 text-sm font-medium text-primary bg-background hover:bg-primary/5 rounded-lg transition-all border border-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCropComplete}
                  disabled={!croppedAreaPixels || processing}
                  className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Icons.check size={16} />
                      Apply Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      );
}
