'use client';

import { useState } from 'react';
import { Icons } from '@/config/icons';
import ImageUpload from '@/components/shared/ImageUpload';

interface BannerSettingsProps {
  banners: string[];
  isEditing: boolean;
  onChange: (banners: string[]) => void;
}

export default function BannerSettings({
  banners,
  isEditing,
  onChange,
}: BannerSettingsProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleAddBanner = () => {
    onChange([...(banners || []), '']);
  };

  const handleRemoveBanner = (index: number) => {
    const newBanners = banners.filter((_, i) => i !== index);
    onChange(newBanners);
  };

  const handleBannerChange = (index: number, url: string) => {
    const newBanners = [...banners];
    newBanners[index] = url;
    onChange(newBanners);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!isEditing) {
      e.preventDefault();
      return;
    }
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!isEditing || draggedIndex === null || draggedIndex === index) return;
    
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!isEditing || draggedIndex === null) return;

    const newBanners = [...banners];
    const draggedItem = newBanners[draggedIndex];
    newBanners.splice(draggedIndex, 1);
    newBanners.splice(index, 0, draggedItem);

    onChange(newBanners);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="bg-background rounded-lg border border-primary/10 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
          <Icons.images size={20} className="text-accent" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-primary font-heading">
            Banner Images
          </h2>
          <p className="text-sm text-secondary font-body">
            Manage banner images for the app
          </p>
        </div>
      </div>

      {banners && banners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((banner, index) => (
            <div
              key={index}
              draggable={isEditing}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`group relative bg-background rounded-lg p-4 transition-all duration-200 border  flex flex-col ${
                isEditing ? 'cursor-move hover:border-accent hover:shadow-md' : 'cursor-default border-primary/10'
              } ${draggedIndex === index ? 'opacity-40 scale-95' : 'opacity-100 scale-100'} ${
                dragOverIndex === index && draggedIndex !== index ? 'border-accent border-dashed bg-accent/5' : 'border-primary/10'
              }`}
            >
              {/* Header with Drag Handle and Delete */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {isEditing && (
                    <div className="flex-shrink-0 p-1.5 bg-secondary/10 rounded-md group-hover:bg-accent/20 transition-colors">
                      <Icons.menu size={18} className="text-secondary group-hover:text-accent transition-colors" />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-primary font-body bg-accent/30 px-2 py-1 rounded-md">
                      Banner {index + 1}
                    </h3>
                  </div>
                </div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => handleRemoveBanner(index)}
                    className="p-2 text-secondary hover:text-white hover:bg-secondary rounded-lg transition-all"
                    title="Remove banner"
                  >
                    <Icons.trash size={18} />
                  </button>
                )}
              </div>

              {/* Banner Content */}
              <div className="flex-1 flex flex-col">
                {isEditing ? (
                  <div className="flex-1">
                    <ImageUpload
                      value={banner}
                      onChange={(url) => handleBannerChange(index, url)}
                      folder="app-settings"
                      label=""
                    />
                  </div>
                ) : (
                  <>
                    {banner ? (
                      <div className="relative w-full rounded-lg overflow-hidden border border-primary/10 ">
                        <img
                          src={banner}
                          alt={`Banner ${index + 1}`}
                          className="w-full h-auto object-cover"
                          style={{ maxHeight: '300px' }}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full bg-secondary/5 rounded-lg border border-dashed border-secondary/30">
                        <div className="text-center">
                          <Icons.images size={32} className="text-secondary/50 mx-auto mb-2" />
                          <p className="text-sm text-secondary font-body">
                            No image uploaded
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Drag Indicator */}
              {isEditing && draggedIndex === index && (
                <div className="absolute inset-0 bg-accent/10 rounded-lg flex items-center justify-center pointer-events-none">
                  <div className="bg-white px-4 py-2 rounded-lg shadow-lg border border-accent">
                    <p className="text-sm font-semibold text-accent">Moving...</p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add Banner Card - Only show in edit mode */}
          {isEditing && (
            <div
              onClick={handleAddBanner}
              className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-lg border border-dashed border-accent/30 p-4 hover:border-accent hover:from-accent/10 hover:to-accent/20 hover:shadow-md transition-all cursor-pointer min-h-[420px] flex items-center justify-center group"
            >
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icons.plus size={40} className="text-accent" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-primary font-body">
                    Add Banner
                  </p>
                  <p className="text-sm text-secondary font-body mt-1">
                    Click to add new banner image
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-background to-secondary/5 rounded-lg border border-dashed border-primary/20">
          <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
            <Icons.images size={40} className="text-secondary" />
          </div>
          <h3 className="text-lg font-bold text-primary font-body mb-2">
            No Banners Added
          </h3>
          <p className="text-secondary font-body text-sm mb-6 text-center max-w-md">
            Add banner images to display in your app
          </p>
          {isEditing && (
            <button
              type="button"
              onClick={handleAddBanner}
              className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent/90 hover:shadow-md transition-all"
            >
              <Icons.plus size={20} />
              <span>Add First Banner</span>
            </button>
          )}
        </div>
      )}

      {/* Info Footer - Only show in view mode when banners exist */}
      {!isEditing && banners && banners.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Icons.info size={20} className="text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-primary font-body mb-1">
                Banner Display Order
              </p>
              <p className="text-xs text-secondary font-body">
                Banners are displayed in the order shown above. Click <strong>Edit Settings</strong> to reorder or manage banners.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
