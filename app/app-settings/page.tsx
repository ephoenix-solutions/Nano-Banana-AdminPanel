'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { UpdateAppSettingsInput } from '@/lib/types/app-settings.types';
import {
  getAppSettings,
  updateAppSettings,
  initializeAppSettings,
} from '@/lib/services/app-settings.service';
import { logAppSettingsActivity } from '@/lib/services/app-settings-activity.service';
import { FieldChange } from '@/lib/types/app-settings-activity.types';
import { useAuth } from '@/lib/hooks/useAuth';
import { exportAppSettings, ExportFormat } from '@/lib/utils/exportAppSettings';

import PageHeader from '@/components/app-settings/PageHeader';
import StatusMessages from '@/components/app-settings/StatusMessages';
import VersionSettings from '@/components/app-settings/VersionSettings';
import DeviceSecuritySettings from '@/components/app-settings/DeviceSecuritySettings';
import LanguageSettings from '@/components/app-settings/LanguageSettings';
import PrivacyPolicySettings from '@/components/app-settings/PrivacyPolicySettings';
import TermsSettings from '@/components/app-settings/TermsSettings';
import BannerSettings from '@/components/app-settings/BannerSettings';

export default function AppSettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newLanguage, setNewLanguage] = useState('');
  const [originalData, setOriginalData] = useState<UpdateAppSettingsInput>({
    languagesSupported: [],
    privacyPolicy: '',
    terms: '',
    minimumVersion: '',
    liveVersion: '',
    banner: '',
    maxAccountsPerDevice: 3,
  });
  const [formData, setFormData] = useState<UpdateAppSettingsInput>({
    languagesSupported: [],
    privacyPolicy: '',
    terms: '',
    minimumVersion: '',
    liveVersion: '',
    banner: '',
    maxAccountsPerDevice: 3,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await initializeAppSettings();
      
      const settings = await getAppSettings();
      if (settings) {
        const data = {
          languagesSupported: settings.languagesSupported || [],
          privacyPolicy: settings.privacyPolicy || '',
          terms: settings.terms || '',
          minimumVersion: settings.minimumVersion || '',
          liveVersion: settings.liveVersion || '',
          banner: settings.banner || '',
          maxAccountsPerDevice: settings.maxAccountsPerDevice || 3,
        };
        setFormData(data);
        setOriginalData(data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load app settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      // Handle empty input for number fields
      if (value === '' || value === null || value === undefined) {
        setFormData((prev) => ({
          ...prev,
          [name]: name === 'maxAccountsPerDevice' ? 3 : 0, // Default to 3 for device limit
        }));
      } else {
        const numValue = parseInt(value);
        setFormData((prev) => ({
          ...prev,
          [name]: isNaN(numValue) ? (name === 'maxAccountsPerDevice' ? 3 : 0) : numValue,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddLanguage = () => {
    if (!isEditing) return;
    
    if (newLanguage.trim() && formData.languagesSupported) {
      if (!formData.languagesSupported.includes(newLanguage.trim())) {
        setFormData((prev) => ({
          ...prev,
          languagesSupported: [...(prev.languagesSupported || []), newLanguage.trim()],
        }));
        setNewLanguage('');
      } else {
        setError('Language already exists');
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  const handleRemoveLanguage = (language: string) => {
    if (!isEditing) return;
    
    setFormData((prev) => ({
      ...prev,
      languagesSupported: (prev.languagesSupported || []).filter((l) => l !== language),
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(originalData);
    setNewLanguage('');
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (!formData.minimumVersion?.trim()) {
        throw new Error('Minimum version is required');
      }
      if (!formData.liveVersion?.trim()) {
        throw new Error('Live version is required');
      }
      if (!formData.languagesSupported || formData.languagesSupported.length === 0) {
        throw new Error('At least one language is required');
      }
      if (formData.maxAccountsPerDevice && formData.maxAccountsPerDevice < 1) {
        throw new Error('Max accounts per device must be at least 1');
      }

      // Track changes
      const changes: FieldChange[] = [];
      
      if (formData.minimumVersion !== originalData.minimumVersion) {
        changes.push({
          field: 'minimumVersion',
          fieldLabel: 'Minimum Version',
          oldValue: originalData.minimumVersion,
          newValue: formData.minimumVersion,
        });
      }
      
      if (formData.liveVersion !== originalData.liveVersion) {
        changes.push({
          field: 'liveVersion',
          fieldLabel: 'Live Version',
          oldValue: originalData.liveVersion,
          newValue: formData.liveVersion,
        });
      }
      
      if (formData.maxAccountsPerDevice !== originalData.maxAccountsPerDevice) {
        changes.push({
          field: 'maxAccountsPerDevice',
          fieldLabel: 'Max Accounts Per Device',
          oldValue: originalData.maxAccountsPerDevice,
          newValue: formData.maxAccountsPerDevice,
        });
      }
      
      if (JSON.stringify(formData.languagesSupported) !== JSON.stringify(originalData.languagesSupported)) {
        changes.push({
          field: 'languagesSupported',
          fieldLabel: 'Supported Languages',
          oldValue: originalData.languagesSupported?.join(', ') || '',
          newValue: formData.languagesSupported?.join(', ') || '',
        });
      }
      
      if (formData.privacyPolicy !== originalData.privacyPolicy) {
        changes.push({
          field: 'privacyPolicy',
          fieldLabel: 'Privacy Policy URL',
          oldValue: originalData.privacyPolicy || '(empty)',
          newValue: formData.privacyPolicy || '(empty)',
        });
      }
      
      if (formData.terms !== originalData.terms) {
        changes.push({
          field: 'terms',
          fieldLabel: 'Terms & Conditions URL',
          oldValue: originalData.terms || '(empty)',
          newValue: formData.terms || '(empty)',
        });
      }
      
      if (formData.banner !== originalData.banner) {
        changes.push({
          field: 'banner',
          fieldLabel: 'Banner Image URL',
          oldValue: originalData.banner || '(empty)',
          newValue: formData.banner || '(empty)',
        });
      }

      await updateAppSettings(formData);
      
      // Log activity if there are changes and user is logged in
      if (changes.length > 0 && user) {
        await logAppSettingsActivity({
          adminId: user.id,
          adminName: user.name,
          adminEmail: user.email,
          changes,
        });
      }
      
      setOriginalData(formData);
      setIsEditing(false);
      setSuccess('Settings updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error updating settings:', err);
      setError(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  // Check if there are any changes
  const hasChanges = () => {
    return (
      formData.minimumVersion !== originalData.minimumVersion ||
      formData.liveVersion !== originalData.liveVersion ||
      formData.privacyPolicy !== originalData.privacyPolicy ||
      formData.terms !== originalData.terms ||
      formData.banner !== originalData.banner ||
      formData.maxAccountsPerDevice !== originalData.maxAccountsPerDevice ||
      JSON.stringify(formData.languagesSupported) !== JSON.stringify(originalData.languagesSupported)
    );
  };

  // Handle export
  const handleExport = async (format: ExportFormat) => {
    try {
      const settings = await getAppSettings();
      exportAppSettings(format, settings);
    } catch (err) {
      console.error('Error exporting settings:', err);
      setError('Failed to export settings');
      setTimeout(() => setError(null), 3000);
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
        <Breadcrumbs items={[{ label: 'App Settings' }]} />

        <PageHeader
          isEditing={isEditing}
          saving={saving}
          hasChanges={hasChanges()}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onSave={handleSave}
          onExport={handleExport}
        />

        <StatusMessages success={success} error={error} />

        <div className="grid grid-cols-1 gap-6">
          <VersionSettings
            minimumVersion={formData.minimumVersion || ''}
            liveVersion={formData.liveVersion || ''}
            isEditing={isEditing}
            onChange={handleChange}
          />

          <DeviceSecuritySettings
            maxAccountsPerDevice={formData.maxAccountsPerDevice || 3}
            originalMaxAccounts={originalData.maxAccountsPerDevice || 3}
            isEditing={isEditing}
            onChange={handleChange}
          />

          <LanguageSettings
            languages={formData.languagesSupported || []}
            newLanguage={newLanguage}
            isEditing={isEditing}
            onNewLanguageChange={setNewLanguage}
            onAddLanguage={handleAddLanguage}
            onRemoveLanguage={handleRemoveLanguage}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PrivacyPolicySettings
              privacyPolicy={formData.privacyPolicy || ''}
              isEditing={isEditing}
              onChange={handleChange}
            />

            <TermsSettings
              terms={formData.terms || ''}
              isEditing={isEditing}
              onChange={handleChange}
            />
          </div>

          <BannerSettings
            banner={formData.banner || ''}
            isEditing={isEditing}
            onChange={handleChange}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
