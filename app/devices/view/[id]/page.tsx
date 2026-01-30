'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import ConfirmModal from '@/components/ConfirmModal';
import { Device, DeviceAccount } from '@/lib/types/device.types';
import { getDeviceById, removeAccountFromDevice } from '@/lib/services/device.service';

export default function DeviceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const deviceId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [device, setDevice] = useState<Device | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [removeModal, setRemoveModal] = useState<{ isOpen: boolean; account: DeviceAccount | null }>({
    isOpen: false,
    account: null,
  });

  useEffect(() => {
    fetchDevice();
  }, [deviceId]);

  const fetchDevice = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDeviceById(deviceId);
      
      if (data) {
        setDevice(data);
      } else {
        setError('Device not found');
      }
    } catch (err) {
      console.error('Error fetching device:', err);
      setError('Failed to load device details');
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
    router.push('/devices');
  };

  const handleRemoveAccount = (account: DeviceAccount) => {
    setRemoveModal({ isOpen: true, account });
  };

  const handleRemoveConfirm = async () => {
    if (!removeModal.account || !device) return;
    
    try {
      await removeAccountFromDevice(device.deviceId, removeModal.account.userId);
      setRemoveModal({ isOpen: false, account: null });
      fetchDevice(); // Refresh
    } catch (err) {
      console.error('Error removing account:', err);
      setError('Failed to remove account');
    }
  };

  const handleViewUser = (userId: string) => {
    router.push(`/users/view/${userId}`);
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

  if (error || !device) {
    return (
      <AdminLayout>
        <div className="w-full">
          <Breadcrumbs 
            items={[
              { label: 'Devices', href: '/devices' },
              { label: 'View Device' }
            ]} 
          />
          <div className="bg-secondary/10 border border-secondary rounded-lg p-4 mt-6">
            <div className="flex items-center gap-2">
              <Icons.alert size={20} className="text-secondary" />
              <p className="text-secondary font-body">{error || 'Device not found'}</p>
            </div>
          </div>
          <button
            onClick={handleBack}
            className="mt-4 flex items-center gap-2 px-6 py-3 bg-background text-primary rounded-lg font-semibold hover:bg-primary/5 transition-all border border-primary/10"
          >
            <Icons.arrowLeft size={20} />
            <span>Back to Devices</span>
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
            { label: 'Devices', href: '/devices' },
            { label: 'View Device' }
          ]} 
        />

        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-secondary hover:text-primary mb-4 transition-colors"
          >
            <Icons.arrowLeft size={20} />
            <span className="font-body text-sm">Back to Devices</span>
          </button>
          <h1 className="text-4xl font-bold text-primary font-heading">
            Device Details
          </h1>
          <p className="text-secondary mt-2 font-body">
            View device information and manage accounts
          </p>
        </div>

        <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
          <div className="bg-gradient-to-r from-accent/10 to-secondary/10 p-8 border-b border-primary/10">
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-primary font-heading mb-2">
                  {device.deviceInfo.model}
                </h2>
                <p className="text-lg text-secondary font-body mb-3">
                  {device.deviceInfo.os} • App v{device.deviceInfo.appVersion}
                </p>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    device.accountCount >= 3
                      ? 'bg-secondary/20 text-secondary'
                      : 'bg-accent/20 text-accent'
                  }`}>
                    <Icons.users size={16} className="mr-2" />
                    {device.accountCount} account{device.accountCount !== 1 ? 's' : ''}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary/20 text-secondary">
                    <Icons.clock size={16} className="mr-2" />
                    Last: {formatTimestamp(device.lastLoginAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <h3 className="text-xl font-bold text-primary font-heading mb-6">
              Device Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-background rounded-lg p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icons.smartphone size={20} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-secondary font-body mb-1">Device ID</p>
                    <p className="text-sm font-mono text-primary font-body break-all">
                      {device.deviceId}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-background rounded-lg p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icons.users size={20} className="text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-secondary font-body mb-1">Account Count</p>
                    <p className="text-base font-semibold text-primary font-body">
                      {device.accountCount} / 3 accounts
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
                    <p className="text-sm text-secondary font-body mb-1">First Login</p>
                    <p className="text-base font-semibold text-primary font-body">
                      {formatTimestamp(device.firstLoginAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-background rounded-lg p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icons.clock size={20} className="text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-secondary font-body mb-1">Last Login</p>
                    <p className="text-base font-semibold text-primary font-body">
                      {formatTimestamp(device.lastLoginAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-primary font-heading mb-6">
              Accounts on This Device
            </h3>

            <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-background border-b border-primary/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">
                        First Login
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-secondary uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/10">
                    {device.accounts.map((account) => (
                      <tr key={account.userId} className="hover:bg-background/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                              {account.photoURL ? (
                                <img
                                  src={account.photoURL}
                                  alt={account.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <Icons.user size={20} className="text-accent" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-primary">
                                {account.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-secondary break-all">
                            {account.email}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-secondary">
                            <Icons.clock size={16} />
                            <span>{formatTimestamp(account.firstLoginAt)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-secondary">
                            <Icons.clock size={16} />
                            <span>{formatTimestamp(account.lastLoginAt)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewUser(account.userId)}
                              className="p-2 text-white bg-accent hover:bg-accent/90 rounded-md transition-all cursor-pointer"
                              title="View User"
                            >
                              <Icons.eye size={18} />
                            </button>
                            <button
                              onClick={() => handleRemoveAccount(account)}
                              className="p-2 text-white bg-secondary hover:bg-secondary/90 rounded-md transition-all cursor-pointer"
                              title="Remove Account"
                            >
                              <Icons.trash size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Remove Account Modal */}
        <ConfirmModal
          isOpen={removeModal.isOpen}
          onClose={() => setRemoveModal({ isOpen: false, account: null })}
          onConfirm={handleRemoveConfirm}
          title="Remove Account from Device"
          message={`Are you sure you want to remove ${removeModal.account?.name} from this device? The user can login again later.`}
          confirmText="Remove"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </AdminLayout>
  );
}
