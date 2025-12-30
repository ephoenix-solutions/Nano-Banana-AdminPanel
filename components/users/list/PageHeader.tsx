import { Icons } from '@/config/icons';

interface PageHeaderProps {
  onAddUser: () => void;
}

export default function PageHeader({ onAddUser }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold text-primary font-heading">
          Users
        </h1>
        <p className="text-secondary mt-2 font-body">
          Manage all users in the system
        </p>
      </div>
      <button
        onClick={onAddUser}
        className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
      >
        <Icons.plus size={20} />
        <span>Add User</span>
      </button>
    </div>
  );
}
