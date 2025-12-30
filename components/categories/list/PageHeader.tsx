import { Icons } from '@/config/icons';

interface PageHeaderProps {
  onAddCategory: () => void;
}

export default function PageHeader({ onAddCategory }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold text-primary font-heading">
          Categories
        </h1>
        <p className="text-secondary mt-2 font-body">
          Manage categories and subcategories
        </p>
      </div>
      <button
        onClick={onAddCategory}
        className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
      >
        <Icons.plus size={20} />
        <span>Add Category</span>
      </button>
    </div>
  );
}
