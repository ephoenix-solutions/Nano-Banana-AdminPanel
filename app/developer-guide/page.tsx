'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';

interface Field {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example: string;
}

interface Collection {
  id: string;
  name: string;
  icon: any;
  description: string;
  firebaseCollection: string;
  fields: Field[];
}

const collections: Collection[] = [
  {
    id: 'users',
    name: 'Users',
    icon: Icons.users,
    description: 'Manage app users and their authentication data',
    firebaseCollection: 'users',
    fields: [
      { name: 'id', type: 'string', required: true, description: 'Unique user identifier', example: 'user_abc123' },
      { name: 'name', type: 'string', required: true, description: 'User full name', example: 'John Doe' },
      { name: 'email', type: 'string', required: true, description: 'User email address', example: 'john@example.com' },
      { name: 'provider', type: 'string', required: true, description: 'Auth provider (google/apple)', example: 'google' },
      { name: 'language', type: 'string', required: true, description: 'Preferred language code', example: 'en' },
      { name: 'photoURL', type: 'string', required: true, description: 'Profile photo URL', example: 'https://example.com/photo.jpg' },
      { name: 'role', type: 'string', required: true, description: 'User role (user/admin)', example: 'user' },
      { name: 'password', type: 'string', required: false, description: 'Hashed password (optional)', example: 'hashed_password_string' },
      { name: 'createdBy', type: 'string', required: false, description: 'Manual created user by User', example: 'user_abc123' },
      { name: 'createdAt', type: 'Timestamp', required: true, description: 'Account creation date', example: 'Timestamp.now()' },
      { name: 'lastLogin', type: 'Timestamp', required: true, description: 'Last login timestamp', example: 'Timestamp.now()' },
      { name: 'generatedCount', type: 'number', required: true, description: 'Total images generated (lifetime)', example: '150' },
      { name: 'currentPeriodCount', type: 'number', required: true, description: 'Images generated in current subscription period', example: '25' },
      { name: 'lastResetDate', type: 'Timestamp', required: true, description: 'When generation count was last reset', example: 'Timestamp.now()' },
    ],
  },
  {
    id: 'categories',
    name: 'Categories',
    icon: Icons.categories,
    description: 'Organize prompts into categories and subcategories',
    firebaseCollection: 'categories',
    fields: [
      { name: 'id', type: 'string', required: true, description: 'Unique category ID', example: 'cat_001' },
      { name: 'name', type: 'string', required: true, description: 'Category display name', example: 'Nature' },
      { name: 'iconImage', type: 'string', required: true, description: 'Category icon URL', example: 'https://example.com/icon.png' },
      { name: 'order', type: 'number', required: true, description: 'Display order (lower first)', example: '1' },
      { name: 'searchCount', type: 'number', required: true, description: 'Total searches in category', example: '150' },
      { name: 'subcategories', type: 'Subcategory[]', required: false, description: 'Array of subcategories', example: '[{id, name, order}]' },
      { name: 'createdBy', type: 'string', required: true, description: 'User ID who created', example: 'user_abc123' },
      { name: 'createdAt', type: 'Timestamp', required: true, description: 'Creation timestamp', example: 'Timestamp.now()' },
      { name: 'updatedBy', type: 'string', required: false, description: 'User ID who last updated', example: 'user_abc123' },
      { name: 'updatedAt', type: 'Timestamp', required: false, description: 'Last update timestamp', example: 'Timestamp.now()' },
    ],
  },
  {
    id: 'subcategories',
    name: 'Subcategories',
    icon: Icons.file,
    description: 'Sub-level categorization within categories',
    firebaseCollection: 'categories (nested)',
    fields: [
      { name: 'id', type: 'string', required: true, description: 'Unique subcategory ID', example: 'subcat_001' },
      { name: 'name', type: 'string', required: true, description: 'Subcategory name', example: 'Mountains' },
      { name: 'order', type: 'number', required: true, description: 'Display order', example: '1' },
      { name: 'searchCount', type: 'number', required: true, description: 'Search count', example: '50' },
      { name: 'createdBy', type: 'string', required: true, description: 'User ID who created', example: 'user_abc123' },
      { name: 'createdAt', type: 'Timestamp', required: true, description: 'Creation timestamp', example: 'Timestamp.now()' },
      { name: 'updatedBy', type: 'string', required: false, description: 'User ID who last updated', example: 'user_abc123' },
      { name: 'updatedAt', type: 'Timestamp', required: false, description: 'Last update timestamp', example: 'Timestamp.now()' },
    ],
  },
  {
    id: 'prompts',
    name: 'Prompts',
    icon: Icons.images,
    description: 'AI image generation prompts with metadata and engagement tracking',
    firebaseCollection: 'prompt',
    fields: [
      { name: 'id', type: 'string', required: true, description: 'Unique prompt ID', example: 'prompt_xyz789' },
      { name: 'title', type: 'string', required: true, description: 'Prompt title', example: 'Sunset Mountain' },
      { name: 'prompt', type: 'string', required: true, description: 'Full AI prompt text', example: 'A beautiful sunset over mountains' },
      { name: 'categoryId', type: 'string', required: true, description: 'Parent category ID', example: 'cat_001' },
      { name: 'subCategoryId', type: 'string', required: true, description: 'Subcategory ID', example: 'subcat_001' },
      { name: 'url', type: 'string', required: true, description: 'Generated image URL', example: 'https://example.com/image.jpg' },
      { name: 'imageRequirement', type: 'number', required: true, description: 'Image requirement (-1: none, 0: optional, 1-4: required count)', example: '0' },
      { name: 'tags', type: 'string[]', required: true, description: 'Array of tags', example: '["nature", "sunset"]' },
      { name: 'isTrending', type: 'boolean', required: true, description: 'Trending status', example: 'true' },
      { name: 'likesCount', type: 'number', required: true, description: 'Total likes count (auto-maintained)', example: '245' },
      { name: 'savesCount', type: 'number', required: true, description: 'Total saves count (auto-maintained)', example: '89' },
      { name: 'searchCount', type: 'number', required: true, description: 'Search count', example: '1200' },
      { name: 'createdAt', type: 'Timestamp', required: true, description: 'Creation timestamp', example: 'Timestamp.now()' },
      { name: 'createdBy', type: 'string', required: true, description: 'User ID who created', example: 'user_abc123' },
      { name: 'updatedBy', type: 'string', required: false, description: 'User ID who last updated', example: 'user_abc123' },
      { name: 'updatedAt', type: 'Timestamp', required: false, description: 'Last update timestamp', example: 'Timestamp.now()' },
    ],
  },
  {
    id: 'prompt-likes',
    name: 'Prompt Likes',
    icon: Icons.check,
    description: 'User likes for prompts (subcollection under each prompt)',
    firebaseCollection: 'prompt/{promptId}/likes/{userId}',
    fields: [
      { name: 'createdAt', type: 'Timestamp', required: true, description: 'Like timestamp', example: 'Timestamp.now()' },
    ],
  },
  {
    id: 'prompt-saves',
    name: 'Prompt Saves',
    icon: Icons.bookmark,
    description: 'User saves for prompts (subcollection under each prompt)',
    firebaseCollection: 'prompt/{promptId}/saves/{userId}',
    fields: [
      { name: 'createdAt', type: 'Timestamp', required: true, description: 'Save timestamp', example: 'Timestamp.now()' },
    ],
  },
  {
    id: 'countries',
    name: 'Countries',
    icon: Icons.globe,
    description: 'Country-specific category assignments',
    firebaseCollection: 'countries',
    fields: [
      { name: 'id', type: 'string', required: true, description: 'Unique country ID', example: 'country_us' },
      { name: 'name', type: 'string', required: true, description: 'Country name', example: 'United States' },
      { name: 'isoCode', type: 'string', required: true, description: 'ISO country code', example: 'US' },
      { name: 'categories', type: 'string[]', required: true, description: 'Assigned category IDs', example: '["cat_001", "cat_002"]' },
      { name: 'createdAt', type: 'Timestamp', required: true, description: 'Creation timestamp', example: 'Timestamp.now()' },
      { name: 'createdBy', type: 'string', required: true, description: 'User ID who created', example: 'user_abc123' },
      { name: 'updatedBy', type: 'string', required: false, description: 'User ID who last updated', example: 'user_abc123' },
      { name: 'updatedAt', type: 'Timestamp', required: false, description: 'Last update timestamp', example: 'Timestamp.now()' },
    ],
  },
  {
    id: 'subscription-plans',
    name: 'Subscription Plans',
    icon: Icons.subscriptionPlan,
    description: 'Manage subscription tiers and pricing',
    firebaseCollection: 'subscription_plans',
    fields: [
      { name: 'id', type: 'string', required: true, description: 'Unique plan ID', example: 'plan_premium' },
      { name: 'name', type: 'string', required: true, description: 'Plan name', example: 'Premium Plan' },
      { name: 'price', type: 'string', required: true, description: 'Plan price', example: '9.99' },
      { name: 'currency', type: 'string', required: true, description: 'Currency code', example: 'USD' },
      { name: 'durationDays', type: 'number', required: true, description: 'Plan duration in days', example: '30' },
      { name: 'generationLimit', type: 'number', required: true, description: 'Max generations allowed', example: '100' },
      { name: 'features', type: 'string[]', required: true, description: 'Plan features list', example: '["HD Images", "No Ads"]' },
      { name: 'isActive', type: 'boolean', required: true, description: 'Plan visibility status', example: 'true' },
      { name: 'order', type: 'number', required: true, description: 'Display order', example: '1' },
      { name: 'createdAt', type: 'Timestamp', required: true, description: 'Creation timestamp', example: 'Timestamp.now()' },
      { name: 'createdBy', type: 'string', required: true, description: 'User ID who created', example: 'user_abc123' },
      { name: 'updatedBy', type: 'string', required: false, description: 'User ID who last updated', example: 'user_abc123' },
      { name: 'updatedAt', type: 'Timestamp', required: false, description: 'Last update timestamp', example: 'Timestamp.now()' },
    ],
  },
  {
    id: 'user-subscriptions',
    name: 'User Subscriptions',
    icon: Icons.userSubscription,
    description: 'Track user subscription purchases',
    firebaseCollection: 'user_subscriptions',
    fields: [
      { name: 'id', type: 'string', required: true, description: 'Unique subscription ID', example: 'sub_abc123' },
      { name: 'userId', type: 'string', required: true, description: 'User ID reference', example: 'user_abc123' },
      { name: 'planId', type: 'string', required: true, description: 'Plan ID reference', example: 'plan_premium' },
      { name: 'startDate', type: 'Timestamp', required: true, description: 'Subscription start date', example: 'Timestamp.now()' },
      { name: 'endDate', type: 'Timestamp', required: true, description: 'Subscription end date', example: 'Timestamp.now()' },
      { name: 'isActive', type: 'boolean', required: false, description: 'Active status', example: 'true' },
      { name: 'paymentMethod', type: 'string', required: true, description: 'Payment method used', example: 'credit_card' },
      { name: 'transactionId', type: 'string', required: true, description: 'Payment transaction ID', example: 'txn_xyz789' },
    ],
  },
  {
    id: 'feedback',
    name: 'Feedback',
    icon: Icons.feedback,
    description: 'User feedback and ratings',
    firebaseCollection: 'feedback',
    fields: [
      { name: 'id', type: 'string', required: true, description: 'Unique feedback ID', example: 'feedback_001' },
      { name: 'userId', type: 'string', required: true, description: 'User ID reference', example: 'user_abc123' },
      { name: 'message', type: 'string', required: true, description: 'Feedback message', example: 'Great app!' },
      { name: 'rating', type: 'number', required: true, description: 'Rating (1-5)', example: '5' },
      { name: 'deviceInfo', type: 'DeviceInfo', required: true, description: 'Device details object', example: '{model, os, appVersion}' },
      { name: 'createdAt', type: 'Timestamp', required: true, description: 'Feedback timestamp', example: 'Timestamp.now()' },
    ],
  },
  {
    id: 'user-generations',
    name: 'User Generations',
    icon: Icons.images,
    description: 'Track user image generation history and usage',
    firebaseCollection: 'user_generations',
    fields: [
      { name: 'id', type: 'string', required: true, description: 'Unique generation ID', example: 'gen_abc123' },
      { name: 'userId', type: 'string', required: true, description: 'User ID reference', example: 'user_abc123' },
      { name: 'promptId', type: 'string', required: true, description: 'Prompt ID used', example: 'prompt_xyz789' },
      { name: 'promptText', type: 'string', required: true, description: 'Actual prompt text used', example: 'A beautiful sunset' },
      { name: 'imageUrl', type: 'string', required: true, description: 'Generated image URL', example: 'https://example.com/generated.jpg' },
      { name: 'generationStatus', type: 'string', required: true, description: 'Status (pending/success/failed)', example: 'success' },
      { name: 'errorMessage', type: 'string', required: false, description: 'Error message if failed', example: 'API timeout' },
      { name: 'metadata', type: 'object', required: true, description: 'Generation metadata', example: '{model, parameters, processingTime}' },
      { name: 'createdAt', type: 'Timestamp', required: true, description: 'Generation timestamp', example: 'Timestamp.now()' },
      { name: 'subscriptionId', type: 'string', required: false, description: 'Active subscription ID', example: 'sub_abc123' },
      { name: 'planId', type: 'string', required: false, description: 'Plan ID used', example: 'plan_premium' },
    ],
  },
  {
    id: 'app-settings',
    name: 'App Settings',
    icon: Icons.appSettings,
    description: 'Global application configuration Default ID : app_config',
    firebaseCollection: 'app_settings',
    fields: [
      { name: 'id', type: 'string', required: true, description: 'Settings document ID', example: 'settings_main' },
      { name: 'languagesSupported', type: 'string[]', required: false, description: 'Supported language codes', example: '["english", "hindi", "french"]' },
      { name: 'privacyPolicy', type: 'string', required: false, description: 'Privacy policy URL', example: 'https://example.com/privacy' },
      { name: 'terms', type: 'string', required: false, description: 'Terms & conditions URL', example: 'https://example.com/terms' },
      { name: 'minimumVersion', type: 'string', required: false, description: 'Minimum required app version', example: '1.0.0' },
      { name: 'liveVersion', type: 'string', required: false, description: 'Current live app version', example: '1.2.0' },
    ],
  },
];

export default function DeveloperGuidePage() {
  const [selectedCollection, setSelectedCollection] = useState<string>('users');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const currentCollection = collections.find((c) => c.id === selectedCollection);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getTypeColor = (type: string) => {
    if (type.includes('string')) return 'text-blue-600 bg-blue-50';
    if (type.includes('number')) return 'text-green-600 bg-green-50';
    if (type.includes('boolean')) return 'text-purple-600 bg-purple-50';
    if (type.includes('Timestamp')) return 'text-orange-600 bg-orange-50';
    if (type.includes('[]')) return 'text-pink-600 bg-pink-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: 'Developer Guide' }]} />

        {/* Page Header */}
        <div>
          <h1 className="text-4xl font-bold text-primary font-heading">
            Developer Guide
          </h1>
          <p className="text-secondary mt-2 font-body">
            Complete reference for all collections, fields, and data structures
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Collections Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-primary/10 p-4 sticky top-24 self-start">
              <h2 className="text-lg font-bold text-primary font-heading mb-4">
                Collections
              </h2>
              <nav className="space-y-1">
                {collections.map((collection) => {
                  const IconComponent = collection.icon;
                  const isActive = selectedCollection === collection.id;
                  return (
                    <button
                      key={collection.id}
                      onClick={() => setSelectedCollection(collection.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                        isActive
                          ? 'bg-accent text-primary font-semibold'
                          : 'text-secondary hover:bg-background font-medium'
                      }`}
                    >
                      <IconComponent size={18} />
                      <span className="text-sm font-body">{collection.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Collection Details */}
          <div className="lg:col-span-3">
            {currentCollection && (
              <div className="space-y-6">
                {/* Collection Header */}
                <div className="bg-gradient-to-r from-accent/10 to-secondary/10 rounded-lg p-6 border border-primary/10">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <currentCollection.icon size={32} className="text-accent" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-primary font-heading mb-2">
                        {currentCollection.name}
                      </h2>
                      <p className="text-secondary font-body mb-3">
                        {currentCollection.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary/20 text-primary font-mono">
                          <Icons.file size={14} className="mr-2" />
                          {currentCollection.firebaseCollection}
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              currentCollection.firebaseCollection,
                              'collection-name'
                            )
                          }
                          className="p-1.5 hover:bg-accent/20 rounded transition-colors"
                          title="Copy collection name"
                        >
                          {copiedField === 'collection-name' ? (
                            <Icons.check size={16} className="text-accent" />
                          ) : (
                            <Icons.copy size={16} className="text-secondary" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fields Table */}
                <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
                  <div className="p-6 border-b border-primary/10">
                    <h3 className="text-xl font-bold text-primary font-heading">
                      Fields Reference
                    </h3>
                    <p className="text-sm text-secondary font-body mt-1">
                      {currentCollection.fields.length} fields in this collection
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-background border-b border-primary/10">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-primary font-body uppercase">
                            Field Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-primary font-body uppercase">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-primary font-body uppercase">
                            Required
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-primary font-body uppercase">
                            Description
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-primary font-body uppercase">
                            Example
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-semibold text-primary font-body uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-primary/10">
                        {currentCollection.fields.map((field, index) => (
                          <tr
                            key={index}
                            className="hover:bg-background/50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <code className="text-sm font-mono font-semibold text-primary bg-accent/10 px-2 py-1 rounded">
                                {field.name}
                              </code>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium font-mono ${getTypeColor(
                                  field.type
                                )}`}
                              >
                                {field.type}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {field.required ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary/20 text-secondary">
                                  <Icons.alert size={12} className="mr-1" />
                                  Required
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                  Optional
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-secondary font-body">
                                {field.description}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <code className="text-xs font-mono text-primary bg-background px-2 py-1 rounded border border-primary/10">
                                {field.example}
                              </code>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() =>
                                  copyToClipboard(field.example, field.name)
                                }
                                className="p-2 hover:bg-accent/20 rounded transition-colors"
                                title="Copy example"
                              >
                                {copiedField === field.name ? (
                                  <Icons.check size={16} className="text-accent" />
                                ) : (
                                  <Icons.copy size={16} className="text-secondary" />
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* TypeScript Interface */}
                <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
                  <div className="p-6 border-b border-primary/10 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-primary font-heading">
                        TypeScript Interface
                      </h3>
                      <p className="text-sm text-secondary font-body mt-1">
                        Copy and use in your code
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const interfaceCode = `interface ${currentCollection.name.replace(
                          /\s+/g,
                          ''
                        )} {\n${currentCollection.fields
                          .map(
                            (f) =>
                              `  ${f.name}${f.required ? '' : '?'}: ${f.type};`
                          )
                          .join('\n')}\n}`;
                        copyToClipboard(interfaceCode, 'interface');
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all text-sm"
                    >
                      {copiedField === 'interface' ? (
                        <>
                          <Icons.check size={16} />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Icons.copy size={16} />
                          <span>Copy Interface</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-6 bg-gray-900">
                    <pre className="text-sm font-mono text-green-400 overflow-x-auto">
                      <code>
                        {`interface ${currentCollection.name.replace(/\s+/g, '')} {\n`}
                        {currentCollection.fields.map((field) => (
                          <span key={field.name}>
                            {'  '}
                            <span className="text-blue-400">{field.name}</span>
                            {field.required ? '' : '?'}
                            <span className="text-white">: </span>
                            <span className="text-yellow-400">{field.type}</span>
                            <span className="text-white">;</span>
                            {'\n'}
                          </span>
                        ))}
                        {'}'}
                      </code>
                    </pre>
                  </div>
                </div>

                {/* Quick Tips */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <Icons.info size={24} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-lg font-bold text-blue-900 font-heading mb-2">
                        Quick Tips
                      </h4>
                      <ul className="space-y-2 text-sm text-blue-800 font-body">
                        <li className="flex items-start gap-2">
                          <Icons.check size={16} className="flex-shrink-0 mt-0.5" />
                          <span>
                            <strong>Required fields</strong> must be provided when creating new documents
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icons.check size={16} className="flex-shrink-0 mt-0.5" />
                          <span>
                            <strong>Timestamp fields</strong> use Firebase Timestamp.now() for current time
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icons.check size={16} className="flex-shrink-0 mt-0.5" />
                          <span>
                            <strong>Array fields</strong> can be empty [] or contain multiple values
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icons.check size={16} className="flex-shrink-0 mt-0.5" />
                          <span>
                            <strong>Subcollections</strong> (Prompt Likes/Saves) are nested under prompt documents. likesCount and savesCount are auto-maintained counters
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icons.check size={16} className="flex-shrink-0 mt-0.5" />
                          <span>
                            Click the <Icons.copy size={12} className="inline mx-1" /> icon to copy examples to clipboard
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
