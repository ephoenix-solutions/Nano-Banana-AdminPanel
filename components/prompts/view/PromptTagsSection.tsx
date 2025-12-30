import { Prompt } from '@/lib/types/prompt.types';

interface PromptTagsSectionProps {
  prompt: Prompt;
}

export default function PromptTagsSection({ prompt }: PromptTagsSectionProps) {
  if (!prompt.tags || prompt.tags.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold text-primary font-heading mb-4">
        Tags
      </h3>
      <div className="bg-background rounded-lg p-6 border border-primary/10">
        <div className="flex flex-wrap gap-2">
          {prompt.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-accent/20 text-primary border border-accent/30"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
