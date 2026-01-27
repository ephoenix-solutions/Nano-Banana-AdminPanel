import { Icons } from '@/config/icons';
import { LoginHistory } from '@/lib/types/user.types';
import { Timestamp } from 'firebase/firestore';

interface LoginHistoryTableProps {
  loginHistory: LoginHistory[];
  formatTimestamp: (timestamp: Timestamp) => string;
}

export default function LoginHistoryTable({ 
  loginHistory, 
  formatTimestamp 
}: LoginHistoryTableProps) {
  if (!loginHistory || loginHistory.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-primary/10 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.clock size={32} className="text-secondary" />
          </div>
          <h3 className="text-lg font-semibold text-primary font-heading mb-2">
            No Login History
          </h3>
          <p className="text-secondary font-body text-sm">
            This user hasn't logged in yet or login history is not available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
      <div className="p-6 border-b border-primary/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
            <Icons.clock size={20} className="text-accent" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-primary font-heading">
              Login History
            </h3>
            <p className="text-sm text-secondary font-body">
              Recent login activity ({loginHistory.length} records)
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background border-b border-primary/10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-primary font-body uppercase">
                Login Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-primary font-body uppercase">
                Device Model
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-primary font-body uppercase">
                Operating System
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-primary font-body uppercase">
                App Version
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-primary font-body uppercase">
                Device ID
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/10">
            {loginHistory.map((login, index) => (
              <tr
                key={login.id}
                className={`hover:bg-background/50 transition-colors ${
                  index === 0 ? 'bg-accent/5' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {index === 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent">
                        Latest
                      </span>
                    )}
                    <span className="text-sm text-primary font-body">
                      {formatTimestamp(login.loginTime)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Icons.users size={16} className="text-secondary" />
                    <span className="text-sm text-primary font-body">
                      {login.deviceInfo.model || 'Unknown'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-primary font-body">
                    {login.deviceInfo.os || 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary font-mono">
                    v{login.deviceInfo.appVersion || '0.0.0'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <code className="text-xs font-mono text-primary bg-background px-2 py-1 rounded border border-primary/10">
                    {login.deviceId.substring(0, 16)}...
                  </code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
