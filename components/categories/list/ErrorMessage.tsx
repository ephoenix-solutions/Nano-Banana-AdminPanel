import { Icons } from '@/config/icons';

interface ErrorMessageProps {
  message: string | null;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div className="bg-secondary/10 border border-secondary rounded-lg p-4">
      <div className="flex items-center gap-2">
        <Icons.alert size={20} className="text-secondary" />
        <p className="text-secondary font-body">{message}</p>
      </div>
    </div>
  );
}
