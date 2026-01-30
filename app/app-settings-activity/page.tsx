'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import { AppSettingsActivity } from '@/lib/types/app-settings-activity.types';
import { getAppSettingsActivity } from '@/lib/services/app-settings-activity.service';
import { exportAppSettingsActivity, ExportFormat } from '@/lib/utils/exportAppSettingsActivity';

export default function AppSettingsActivityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<AppSettingsActivity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAppSettingsActivity(100);
      setActivities(data);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activity log');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '-';
    
    try {
      let date: Date;
      
      if (timestamp && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      } else if (timestamp && timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else {
        date = new Date(timestamp);
      }
      
      if (isNaN(date.getTime())) {
        return '-';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return '-';
    }
  };

  const handleExport = (format: ExportFormat) => {
    exportAppSettingsActivity(format, {
      activities,
      formatTimestamp,
    });
    setShowExportMenu(false);
  };

  const handleView = (activityId: string) => {
    router.push(`/app-settings-activity/view/${activityId}`);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Breadcrumbs 
          items={[
            { label: 'App Settings', href: '/app-settings' },
            { label: 'Activity Log' }
          ]} 
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary font-heading">
              App Settings Activity Log
            </h1>
            <p className="text-secondary mt-2 font-body">
              Track all changes made to app settings
            </p>
          </div>
          
          {/* Export Button with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-6 py-3 bg-background text-primary rounded-lg font-semibold hover:bg-primary/5 transition-all border border-primary/10"
            >
              <Icons.download size={20} />
              <span>Export</span>
              <Icons.chevronDown size={16} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Export Dropdown Menu */}
            {showExportMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowExportMenu(false)}
                />
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-primary/10 z-20">
                  <div className="py-2">
                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full px-4 py-2 text-left text-sm text-primary hover:bg-background transition-colors flex items-center gap-2"
                    >
                      <Icons.fileText size={16} />
                      <span>Export as CSV</span>
                    </button>
                    <button
                      onClick={() => handleExport('json')}
                      className="w-full px-4 py-2 text-left text-sm text-primary hover:bg-background transition-colors flex items-center gap-2"
                    >
                      <Icons.code size={16} />
                      <span>Export as JSON</span>
                    </button>
                  </div>
                  <div className="border-t border-primary/10 px-4 py-2">
                    <p className="text-xs text-secondary">
                      {activities.length} activit{activities.length !== 1 ? 'ies' : 'y'} will be exported
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-secondary/10 border border-secondary rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Icons.alert size={20} className="text-secondary" />
              <p className="text-secondary font-body text-sm">{error}</p>
            </div>
          </div>
        )}

        {activities.length === 0 ? (
          <div className="bg-white rounded-lg border border-primary/10 p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center">
                <Icons.clock size={32} className="text-secondary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary font-heading mb-2">
                  No Activity Yet
                </h3>
                <p className="text-secondary font-body">
                  Changes to app settings will appear here
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background border-b border-primary/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">
                      Changes
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">
                      Fields Modified
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-secondary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/10">
                  {activities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-background/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-secondary">
                          <Icons.clock size={16} />
                          <span>{formatTimestamp(activity.timestamp)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-sm font-semibold text-primary">
                              {activity.adminName}
                            </p>
                            <p className="text-xs text-secondary">
                              {activity.adminEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent">
                          {activity.changes.length} field{activity.changes.length > 1 ? 's' : ''} changed
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {activity.changes.slice(0, 3).map((change, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-secondary/10 text-secondary"
                            >
                              {change.fieldLabel}
                            </span>
                          ))}
                          {activity.changes.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-secondary/10 text-secondary">
                              +{activity.changes.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(activity.id)}
                            className="p-2 text-white bg-accent hover:bg-accent/90 rounded-md transition-all cursor-pointer"
                            title="View"
                          >
                            <Icons.eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
