import { Icons } from '@/config/icons';

interface ErrorMessageSectionProps {
  errorMessage: string;
}

export default function ErrorMessageSection({ errorMessage }: ErrorMessageSectionProps) {
  if (!errorMessage) return null;

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold text-primary font-heading mb-4">
        Error Details
      </h3>
      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.alert size={20} className="text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-red-600 font-body font-semibold mb-1">
              Generation Failed
            </p>
            <p className="text-base text-red-700 font-body">
              {errorMessage}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
