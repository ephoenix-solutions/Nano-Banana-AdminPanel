import { Prompt } from '@/lib/types/prompt.types';

interface PromptTextSectionProps {
  prompt: Prompt;
}

export default function PromptTextSection({ prompt }: PromptTextSectionProps) {
  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold text-primary font-heading mb-4">
        Full Prompt Text
      </h3>
      <div className="bg-background rounded-lg p-6 border border-primary/10">
        <p className="text-base text-primary font-body leading-relaxed whitespace-pre-wrap">
          {prompt.prompt}
        </p>
      </div>
    </div>
  );
}
