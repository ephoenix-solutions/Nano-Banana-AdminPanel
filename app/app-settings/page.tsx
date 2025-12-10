'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import { AppSettings, UpdateAppSettingsInput } from '@/lib/types/app-settings.types';
import {
  getAppSettings,
  updateAppSettings,
  initializeAppSettings,
} from '@/lib/services/app-settings.service';

export default function AppSettingsPage() {
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
  });
  const [formData, setFormData] = useState<UpdateAppSettingsInput>({
    languagesSupported: [],
    privacyPolicy: '',
    terms: '',
    minimumVersion: '',
    liveVersion: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Initialize if not exists
      await initializeAppSettings();
      
      const settings = await getAppSettings();
      if (settings) {
        const data = {
          languagesSupported: settings.languagesSupported || [],
          privacyPolicy: settings.privacyPolicy || '',
          terms: settings.terms || '',
          minimumVersion: settings.minimumVersion || '',
          liveVersion: settings.liveVersion || '',
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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

      await updateAppSettings(formData);
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
      <div className="w-full">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: 'App Settings' }]} />

        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary font-heading">
              App Settings
            </h1>
            <p className="text-secondary mt-2 font-body">
              Configure application settings and preferences
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-background text-primary rounded-lg font-semibold hover:bg-primary/5 transition-all border border-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icons.close size={20} />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Icons.save size={20} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
              >
                <Icons.edit size={20} />
                <span>Edit Settings</span>
              </button>
            )}
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-accent/10 border border-accent rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <Icons.check size={20} className="text-accent" />
              <p className="text-accent font-body text-sm">{success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-secondary/10 border border-secondary rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <Icons.alert size={20} className="text-secondary" />
              <p className="text-secondary font-body text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-lg border border-primary/10 p-8">
          <div className="space-y-8">
            {/* Version Settings */}
            <div>
              <h2 className="text-xl font-bold text-primary font-heading mb-4">
                Version Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="minimumVersion"
                    className="block text-sm font-semibold text-primary mb-2 font-body"
                  >
                    Minimum Version <span className="text-secondary">*</span>
                  </label>
                  <input
                    type="text"
                    id="minimumVersion"
                    name="minimumVersion"
                    value={formData.minimumVersion || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                    className="w-full px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-60 disabled:cursor-not-allowed"
                    placeholder="1.0.0"
                  />
                </div>

                <div>
                  <label
                    htmlFor="liveVersion"
                    className="block text-sm font-semibold text-primary mb-2 font-body"
                  >
                    Live Version <span className="text-secondary">*</span>
                  </label>
                  <input
                    type="text"
                    id="liveVersion"
                    name="liveVersion"
                    value={formData.liveVersion || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                    className="w-full px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-60 disabled:cursor-not-allowed"
                    placeholder="1.0.0"
                  />
                </div>
              </div>
            </div>

            {/* Languages Supported */}
            <div>
              <h2 className="text-xl font-bold text-primary font-heading mb-4">
                Supported Languages
              </h2>
              <div className="space-y-3">
                {isEditing && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddLanguage();
                        }
                      }}
                      className="flex-1 px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                      placeholder="Enter language (e.g., 'english', 'hindi', 'french')"
                    />
                    <button
                      type="button"
                      onClick={handleAddLanguage}
                      className="px-4 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
                    >
                      <Icons.plus size={20} />
                    </button>
                  </div>
                )}

                {formData.languagesSupported && formData.languagesSupported.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.languagesSupported.map((language) => (
                      <div
                        key={language}
                        className="flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-lg border border-accent/30"
                      >
                        <span className="text-sm text-primary font-body font-medium uppercase">
                          {language}
                        </span>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLanguage(language)}
                            className="text-secondary hover:text-primary transition-colors"
                          >
                            <Icons.close size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Privacy Policy URL */}
            <div>
              <h2 className="text-xl font-bold text-primary font-heading mb-4">
                Privacy Policy
              </h2>
              <div>
                <label
                  htmlFor="privacyPolicy"
                  className="block text-sm font-semibold text-primary mb-2 font-body"
                >
                  Privacy Policy URL
                </label>
                <input
                  type="url"
                  id="privacyPolicy"
                  name="privacyPolicy"
                  value={formData.privacyPolicy || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="https://example.com/privacy-policy"
                />
              </div>
            </div>

            {/* Terms & Conditions URL */}
            <div>
              <h2 className="text-xl font-bold text-primary font-heading mb-4">
                Terms & Conditions
              </h2>
              <div>
                <label
                  htmlFor="terms"
                  className="block text-sm font-semibold text-primary mb-2 font-body"
                >
                  Terms & Conditions URL
                </label>
                <input
                  type="url"
                  id="terms"
                  name="terms"
                  value={formData.terms || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="https://example.com/terms-and-conditions"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
