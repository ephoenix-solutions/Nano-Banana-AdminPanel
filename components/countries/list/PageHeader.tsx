import { Icons } from '@/config/icons';

interface PageHeaderProps {
  onAddCountry: () => void;
}

export default function PageHeader({ onAddCountry }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold text-primary font-heading">
          Countries
        </h1>
        <p className="text-secondary mt-2 font-body">
          Manage country data and assigned categories
        </p>
      </div>
      <button
        onClick={onAddCountry}
        className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
      >
        <Icons.plus size={20} />
        <span>Add Country</span>
      </button>
    </div>
  );
}
