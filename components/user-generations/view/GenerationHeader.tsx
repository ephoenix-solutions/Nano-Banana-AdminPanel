import { Icons } from '@/config/icons';
import { UserGeneration } from '@/lib/types/user-generation.types';

interface GenerationHeaderProps {
  generation: UserGeneration;
}

export default function GenerationHeader({ generation }: GenerationHeaderProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-gradient-to-r from-accent/10 to-secondary/10 p-8 border-b border-primary/10">
      <div className="flex items-center gap-6">
        {/* Generated Image */}
        <div className="relative">
          {generation.imageUrl && generation.generationStatus === 'success' ? (
            <div className="relative group">
              <img
                src={generation.imageUrl}
                alt="Generated"
                className="w-32 h-32 rounded-lg object-cover border-4 border-white shadow-lg"
              />
              {/* Hover overlay to view full image */}
              <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Icons.images size={32} className="text-white" />
              </div>
            </div>
          ) : (
            <div className="w-32 h-32 rounded-lg bg-secondary/20 border-4 border-white shadow-lg flex items-center justify-center">
              <Icons.images size={48} className="text-secondary" />
            </div>
          )}
        </div>

        {/* Generation Basic Info */}
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-primary font-heading mb-2">
            Generation Details
          </h2>
          <p className="text-lg text-secondary font-body mb-3 line-clamp-2">
            {generation.promptText}
          </p>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(generation.generationStatus)}`}>
              {generation.generationStatus === 'success' && (
                <Icons.check size={16} className="mr-2" />
              )}
              {generation.generationStatus === 'failed' && (
                <Icons.x size={16} className="mr-2" />
              )}
              {generation.generationStatus === 'pending' && (
                <Icons.clock size={16} className="mr-2" />
              )}
              {generation.generationStatus}
            </span>
            {generation.metadata?.model && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/20 text-primary">
                <Icons.code size={16} className="mr-2" />
                {generation.metadata.model}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
