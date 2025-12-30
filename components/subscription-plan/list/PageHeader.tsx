import { Icons } from '@/config/icons';

interface PageHeaderProps {
  onAddPlan: () => void;
}

export default function PageHeader({ onAddPlan }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold text-primary font-heading">
          Subscription Plans
        </h1>
        <p className="text-secondary mt-2 font-body">
          Manage subscription plans and pricing
        </p>
      </div>
      <button
        onClick={onAddPlan}
        className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
      >
        <Icons.plus size={20} />
        <span>Add Plan</span>
      </button>
    </div>
  );
}
