import { Icons } from '@/config/icons';

interface FeaturesInputProps {
  features: string[];
  newFeature: string;
  onNewFeatureChange: (value: string) => void;
  onAddFeature: () => void;
  onRemoveFeature: (index: number) => void;
}

export default function FeaturesInput({
  features,
  newFeature,
  onNewFeatureChange,
  onAddFeature,
  onRemoveFeature,
}: FeaturesInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddFeature();
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-primary mb-2 font-body">
        Features
      </label>
      <div className="space-y-3">
        {/* Add Feature Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newFeature}
            onChange={(e) => onNewFeatureChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            placeholder="Enter a feature and press Add"
          />
          <button
            type="button"
            onClick={onAddFeature}
            className="px-4 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
          >
            <Icons.plus size={20} />
          </button>
        </div>

        {/* Features List */}
        {features.length > 0 && (
          <div className="space-y-2">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-4 py-2 bg-background rounded-lg border border-primary/10"
              >
                <span className="text-sm text-primary font-body">
                  {feature}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveFeature(index)}
                  className="text-secondary hover:text-primary transition-colors"
                >
                  <Icons.close size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
