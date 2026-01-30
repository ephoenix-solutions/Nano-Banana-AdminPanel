'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import ConfirmModal from '@/components/ConfirmModal';
import { Icons } from '@/config/icons';
import { Device } from '@/lib/types/device.types';
import { getAllDevices, deleteDevice } from '@/lib/services/device.service';
import { exportDevices, ExportFormat } from '@/lib/utils/exportDevices';

export default function DevicesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<Device[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; device: Device | null }>({
    isOpen: false,
    device: null,
  });

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllDevices();
      setDevices(data);
    } catch (err) {
      console.error('Error fetching devices:', err);
      setError('Failed to load devices');
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
    exportDevices(format, {
      devices,
      formatTimestamp,
    });
    setShowExportMenu(false);
  };

  const handleView = (deviceId: string) => {
    router.push(`/devices/view/${deviceId}`);
  };

  const handleDeleteClick = (device: Device) => {
    setDeleteModal({ isOpen: true, device });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.device) return;

    try {
      await deleteDevice(deleteModal.device.deviceId);
      setDevices(devices.filter(d => d.deviceId !== deleteModal.device!.deviceId));
      setDeleteModal({ isOpen: false, device: null });
    } catch (err) {
      console.error('Error deleting device:', err);
      setError('Failed to delete device');
    }
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
        <Breadcrumbs items={[{ label: 'Devices' }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary font-heading">
              Devices
            </h1>
            <p className="text-secondary mt-2 font-body">
              Manage devices and account limits
            </p>
          </div>
          
          {/* Export Button */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-6 py-3 bg-background text-primary rounded-lg font-semibold hover:bg-primary/5 transition-all border border-primary/10"
            >
              <Icons.download size={20} />
              <span>Export</span>
              <Icons.chevronDown size={16} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
            </button>

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
                      {devices.length} device{devices.length !== 1 ? 's' : ''} will be exported
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Icons.smartphone size={24} className="text-accent" />
              </div>
              <div>
                <p className="text-sm text-secondary font-body">Total Devices</p>
                <p className="text-2xl font-bold text-primary font-heading">{devices.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Icons.users size={24} className="text-secondary" />
              </div>
              <div>
                <p className="text-sm text-secondary font-body">Total Accounts</p>
                <p className="text-2xl font-bold text-primary font-heading">
                  {devices.reduce((sum, d) => sum + d.accountCount, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Icons.alert size={24} className="text-accent" />
              </div>
              <div>
                <p className="text-sm text-secondary font-body">At Limit</p>
                <p className="text-2xl font-bold text-primary font-heading">
                  {devices.filter((d) => d.accountCount >= 3).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Icons.check size={24} className="text-secondary" />
              </div>
              <div>
                <p className="text-sm text-secondary font-body">Available</p>
                <p className="text-2xl font-bold text-primary font-heading">
                  {devices.filter((d) => d.accountCount < 3).length}
                </p>
              </div>
            </div>
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

        {devices.length === 0 ? (
          <div className="bg-white rounded-lg border border-primary/10 p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center">
                <Icons.smartphone size={32} className="text-secondary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary font-heading mb-2">
                  No Devices Yet
                </h3>
                <p className="text-secondary font-body">
                  Devices will appear here when users login from mobile app
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
                      Device ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">
                      Device Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">
                      Accounts
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
                  {devices.map((device) => (
                    <tr key={device.id} className="hover:bg-background/50 transition-colors">
                      <td className="px-6 py-4">
                        <code className="text-xs font-mono text-primary bg-background px-2 py-1 rounded" title={device.deviceId}>
                          {device.deviceId.substring(0, 12)}...
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="text-sm font-semibold text-primary">
                              {device.deviceInfo.model}
                            </p>
                            <p className="text-xs text-secondary">
                              {device.deviceInfo.os}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          device.accountCount >= 3
                            ? 'bg-secondary/20 text-secondary'
                            : 'bg-accent/20 text-accent'
                        }`}>
                          {device.accountCount} account{device.accountCount !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-secondary">
                          <Icons.clock size={16} />
                          <span>{formatTimestamp(device.firstLoginAt)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-secondary">
                          <Icons.clock size={16} />
                          <span>{formatTimestamp(device.lastLoginAt)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(device.deviceId)}
                            className="p-2 text-white bg-accent hover:bg-accent/90 rounded-md transition-all cursor-pointer"
                            title="View"
                          >
                            <Icons.eye size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(device)}
                            className="p-2 text-white bg-secondary hover:bg-secondary/90 rounded-md transition-all cursor-pointer"
                            title="Delete"
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
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, device: null })}
          onConfirm={handleDeleteConfirm}
          title="Delete Device"
          message={`Are you sure you want to delete device "${deleteModal.device?.deviceInfo.model}" (${deleteModal.device?.accountCount} account${deleteModal.device?.accountCount !== 1 ? 's' : ''})? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </AdminLayout>
  );
}
