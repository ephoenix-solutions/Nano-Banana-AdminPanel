import { Icons } from '@/config/icons';
import { useState } from 'react';

interface GeneratedImageSectionProps {
  imageUrl: string;
  promptText: string;
}

export default function GeneratedImageSection({ imageUrl, promptText }: GeneratedImageSectionProps) {
  const [showFullImage, setShowFullImage] = useState(false);

  if (!imageUrl) return null;

  return (
    <>
      <div className="mt-6">
        <h3 className="text-xl font-bold text-primary font-heading mb-4">
          Generated Image
        </h3>
        <div className="bg-background rounded-lg p-4 border border-primary/10">
          <div className="flex flex-col gap-4">
            {/* Image Preview - Fixed Width, Dynamic Height */}
            <div 
              className="relative group cursor-pointer w-full max-w-2xl"
              onClick={() => setShowFullImage(true)}
            >
              <img
                src={imageUrl}
                alt="Generated"
                className="w-full h-auto rounded-lg object-contain border border-primary/10"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <Icons.eye size={48} className="mx-auto mb-2" />
                  <p className="text-sm font-semibold">Click to view full size</p>
                </div>
              </div>
            </div>

            {/* Image URL */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icons.link size={20} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-secondary font-body mb-2">Image URL</p>
                <p className="text-sm text-primary font-body break-all mb-3">
                  {imageUrl}
                </p>
                <a
                  href={imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent/80 font-medium transition-colors"
                >
                  <Icons.globe size={16} />
                  Open in new tab
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Image Modal - Higher z-index, Bigger, No Prompt */}
      {showFullImage && (
        <div 
          className="fixed inset-0 bg-black/95 z-[2000] flex items-center justify-center p-4"
          onClick={() => setShowFullImage(false)}
        >
          <div className="relative w-full h-full flex items-center justify-center max-w-[95vw] max-h-[95vh]">
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute top-4 right-4 p-3 text-white hover:text-accent transition-colors bg-black/50 rounded-lg backdrop-blur-sm z-10"
            >
              <Icons.close size={32} />
            </button>
            <img
              src={imageUrl}
              alt="Generated Image"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}
