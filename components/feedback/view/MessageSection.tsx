import { Feedback } from '@/lib/types/feedback.types';

interface MessageSectionProps {
  feedback: Feedback;
}

export default function MessageSection({ feedback }: MessageSectionProps) {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-primary font-heading mb-4">
        Feedback Message
      </h3>
      <div className="bg-background rounded-lg p-6 border border-primary/10">
        <p className="text-base text-primary font-body leading-relaxed whitespace-pre-wrap wrap-break-word">
          {feedback.message}
        </p>
      </div>
    </div>
  );
}
