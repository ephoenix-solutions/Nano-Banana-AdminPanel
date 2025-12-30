import { Icons } from '@/config/icons';

interface PageHeaderProps {
  // No add button for user subscriptions as they are created by users
}

export default function PageHeader({}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold text-primary font-heading">
          User Subscriptions
        </h1>
        <p className="text-secondary mt-2 font-body">
          Manage user subscription records
        </p>
      </div>
    </div>
  );
}
