'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import { AppSettingsActivity } from '@/lib/types/app-settings-activity.types';
import { getAppSettingsActivity } from '@/lib/services/app-settings-activity.service';

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const activityId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<AppSettingsActivity | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivity();
  }, [activityId]);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      setError(null);
      const activities = await getAppSettingsActivity(100);
      const found = activities.find(a => a.id === activityId);
      
      if (found) {
        setActivity(found);
      } else {
        setError('Activity not found');
      }
    } catch (err) {
      console.error('Error fetching activity:', err);
      setError('Failed to load activity details');
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
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(date);
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return '-';
    }
  };

  const handleBack = () => {
    router.push('/app-settings-activity');
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

  if (error || !activity) {
    return (
      <AdminLayout>
        <div className="w-full">
          <Breadcrumbs 
            items={[
              { label: 'App Settings', href: '/app-settings' },
              { label: 'Activity Log', href: '/app-settings-activity' },
              { label: 'View Activity' }
            ]} 
          />
          <div className="bg-secondary/10 border border-secondary rounded-lg p-4 mt-6">
            <div className="flex items-center gap-2">
              <Icons.alert size={20} className="text-secondary" />
              <p className="text-secondary font-body">{error || 'Activity not found'}</p>
            </div>
          </div>
          <button
            onClick={handleBack}
            className="mt-4 flex items-center gap-2 px-6 py-3 bg-background text-primary rounded-lg font-semibold hover:bg-primary/5 transition-all border border-primary/10"
          >
            <Icons.arrowLeft size={20} />
            <span>Back to Activity Log</span>
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="w-full">
        <Breadcrumbs 
          items={[
            { label: 'App Settings', href: '/app-settings' },
            { label: 'Activity Log', href: '/app-settings-activity' },
            { label: 'View Activity' }
          ]} 
        />

        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-secondary hover:text-primary mb-4 transition-colors"
            >
              <Icons.arrowLeft size={20} />
              <span className="font-body text-sm">Back to Activity Log</span>
            </button>
            <h1 className="text-4xl font-bold text-primary font-heading">
              Activity Details
            </h1>
            <p className="text-secondary mt-2 font-body">
              View detailed information about this activity
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
          <div className="bg-gradient-to-r from-accent/10 to-secondary/10 p-8 border-b border-primary/10">
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-primary font-heading mb-2">
                  {activity.adminName}
                </h2>
                <p className="text-lg text-secondary font-body mb-3">
                  {activity.adminEmail}
                </p>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/20 text-accent">
                    <Icons.edit size={16} className="mr-2" />
                    {activity.changes.length} field{activity.changes.length > 1 ? 's' : ''} changed
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary/20 text-secondary">
                    <Icons.clock size={16} className="mr-2" />
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <h3 className="text-xl font-bold text-primary font-heading mb-6">
              Activity Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-background rounded-lg p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icons.user size={20} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-secondary font-body mb-1">Admin ID</p>
                    <p className="text-base font-semibold text-primary font-body break-all">
                      {activity.adminId}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-background rounded-lg p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icons.info size={20} className="text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-secondary font-body mb-1">Activity ID</p>
                    <p className="text-base font-semibold text-primary font-body break-all">
                      {activity.id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-background rounded-lg p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icons.clock size={20} className="text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-secondary font-body mb-1">Timestamp</p>
                    <p className="text-base font-semibold text-primary font-body">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-background rounded-lg p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icons.edit size={20} className="text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-secondary font-body mb-1">Total Changes</p>
                    <p className="text-base font-semibold text-primary font-body">
                      {activity.changes.length} field{activity.changes.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold text-primary font-heading mb-6">
                Changes Made
              </h3>
              <div className="space-y-4">
                {activity.changes.map((change, index) => (
                  <div
                    key={index}
                    className="bg-background rounded-lg p-6 border border-primary/10"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                        <Icons.edit size={16} className="text-accent" />
                      </div>
                      <h4 className="text-lg font-semibold text-primary font-body">
                        {change.fieldLabel}
                      </h4>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-primary/10">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icons.arrowLeft size={16} className="text-secondary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-secondary font-body mb-2">Previous Value</p>
                            <p className="text-sm text-primary font-body break-all">
                              {String(change.oldValue)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 border border-primary/10">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icons.arrowRight size={16} className="text-accent" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-secondary font-body mb-2">New Value</p>
                            <p className="text-sm text-accent font-body font-semibold break-all">
                              {String(change.newValue)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
