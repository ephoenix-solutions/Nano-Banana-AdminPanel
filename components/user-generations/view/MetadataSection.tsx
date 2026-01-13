import { Icons } from '@/config/icons';

interface MetadataSectionProps {
  metadata: {
    model?: string;
    parameters?: Record<string, any>;
    processingTime?: number;
  };
}

export default function MetadataSection({ metadata }: MetadataSectionProps) {
  if (!metadata || (!metadata.model && !metadata.parameters && !metadata.processingTime)) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold text-primary font-heading mb-4">
        Generation Metadata
      </h3>
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.code size={20} className="text-secondary" />
          </div>
          <div className="flex-1">
            <pre className="text-sm text-primary font-mono bg-white p-4 rounded border border-primary/10 overflow-x-auto">
              {JSON.stringify(metadata, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
