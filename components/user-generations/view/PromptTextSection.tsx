import { Icons } from '@/config/icons';

interface PromptTextSectionProps {
  promptText: string;
}

export default function PromptTextSection({ promptText }: PromptTextSectionProps) {
  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold text-primary font-heading mb-4">
        Prompt Text
      </h3>
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.fileText size={20} className="text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-base text-primary font-body leading-relaxed">
              {promptText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
