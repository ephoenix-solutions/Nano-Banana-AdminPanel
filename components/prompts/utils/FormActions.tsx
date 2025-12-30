import { Icons } from '@/config/icons';

interface FormActionsProps {
  loading: boolean;
  onCancel: () => void;
  submitText?: string;
  loadingText?: string;
}

export default function FormActions({
  loading,
  onCancel,
  submitText = 'Create Prompt',
  loadingText = 'Creating...',
}: FormActionsProps) {
  return (
    <div className="flex items-center justify-end gap-3 pt-4 border-t border-primary/10">
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="px-6 py-3 text-sm font-medium text-primary bg-background hover:bg-primary/5 rounded-lg transition-all border border-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>{loadingText}</span>
          </>
        ) : (
          <>
            <Icons.check size={20} />
            <span>{submitText}</span>
          </>
        )}
      </button>
    </div>
  );
}
