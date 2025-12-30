import { Icons } from '@/config/icons';

interface PageHeaderProps {
  title: string;
  description: string;
  onBack: () => void;
}

export default function PageHeader({ title, description, onBack }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-secondary hover:text-primary mb-4 transition-colors"
      >
        <Icons.arrowLeft size={20} />
        <span className="font-body text-sm">Back to Countries</span>
      </button>
      <h1 className="text-4xl font-bold text-primary font-heading">
        {title}
      </h1>
      <p className="text-secondary mt-2 font-body">
        {description}
      </p>
    </div>
  );
}
