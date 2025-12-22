'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import Table from '@/components/Table';
import ConfirmModal from '@/components/ConfirmModal';
import { Icons } from '@/config/icons';
import { User } from '@/lib/types/user.types';
import { getAllUsers, deleteUser } from '@/lib/services/user.service';
import { Timestamp } from 'firebase/firestore';

type SortField = 'name';
type SortOrder = 'asc' | 'desc';
type RoleFilter = 'all' | 'admin' | 'user';
type ProviderFilter = 'all' | 'google' | 'apple' | 'manual';

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({
    isOpen: false,
    user: null,
  });

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [providerFilter, setProviderFilter] = useState<ProviderFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    router.push('/users/add');
  };

  const handleView = (user: User) => {
    router.push(`/users/view/${user.id}`);
  };

  const handleEdit = (user: User) => {
    router.push(`/users/edit/${user.id}`);
  };

  const handleDeleteClick = (user: User) => {
    setDeleteModal({
      isOpen: true,
      user,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.user) return;

    try {
      await deleteUser(deleteModal.user.id);
      await fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    }
  };

  const formatTimestamp = (timestamp: Timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Filter and Sort Users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = [...users];

    // Search filter (name or email)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Provider filter
    if (providerFilter !== 'all') {
      filtered = filtered.filter((user) => {
        if (providerFilter === 'apple') {
          return user.provider === 'apple' || user.provider === 'ios';
        }
        return user.provider === providerFilter;
      });
    }

    // Sort by name
    filtered.sort((a, b) => {
      const aValue = a.name.toLowerCase();
      const bValue = b.name.toLowerCase();

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [users, searchQuery, sortField, sortOrder, roleFilter, providerFilter]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSortField('name');
    setSortOrder('asc');
    setRoleFilter('all');
    setProviderFilter('all');
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      sortField !== 'name' ||
      sortOrder !== 'asc' ||
      roleFilter !== 'all' ||
      providerFilter !== 'all'
    );
  }, [searchQuery, sortField, sortOrder, roleFilter, providerFilter]);

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (user: User) => (
        <div className="flex items-center gap-3">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white font-semibold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-primary">{user.name}</p>
            </div>
            <p className="text-xs text-secondary">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'provider',
      header: 'Provider',
      render: (user: User) => {
        // Determine color based on provider using app color palette
        let colorClasses = '';
        const provider = user.provider.toLowerCase();
        
        if (provider === 'google') {
          colorClasses = 'bg-accent-100 text-accent-700 ';
        } else if (provider === 'apple' || provider === 'ios') {
          colorClasses = 'bg-primary-100 text-primary-700';
        } else if (provider === 'manual') {
          colorClasses = 'bg-secondary-100 text-secondary-700';
        } else {
          // Fallback for any other provider
          colorClasses = 'bg-accent/20 text-primary';
        }
        
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium capitalize ${colorClasses}`}>
            {user.provider}
          </span>
        );
      },
    },
    {
      key: 'role',
      header: 'Role',
      render: (user: User) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium capitalize ${
          user.role === 'admin' 
            ? 'bg-secondary/20 text-secondary' 
            : 'bg-accent/20 text-primary'
        }`}>
          {user.role || 'user'}
        </span>
      ),
    },
    {
      key: 'language',
      header: 'Language',
      render: (user: User) => (
        <span className="uppercase text-sm font-medium">{user.language}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created At',
      render: (user: User) => (
        <span className="text-sm">{formatTimestamp(user.createdAt)}</span>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      render: (user: User) => (
        <span className="text-sm">{formatTimestamp(user.lastLogin)}</span>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: 'Users' }]} />

        {/* Page Header */}
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
            onClick={handleAddUser}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
          >
            <Icons.plus size={20} />
            <span>Add User</span>
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg border border-primary/10 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icons.search size={20} className="text-secondary" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary placeholder-secondary/50"
                />
              </div>
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg font-semibold transition-all ${
                showFilters || hasActiveFilters
                  ? 'bg-accent/20 border-accent text-primary'
                  : 'border-primary/20 text-secondary hover:bg-accent/10'
              }`}
            >
              <Icons.filter size={20} />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="ml-1 px-2 py-0.5 bg-accent text-primary text-xs rounded-full font-bold">
                  {[
                    searchQuery.trim() !== '',
                    roleFilter !== 'all',
                    providerFilter !== 'all',
                    sortOrder !== 'asc',
                  ].filter(Boolean).length}
                </span>
              )}
            </button>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2.5 border border-secondary/20 text-secondary rounded-lg font-semibold hover:bg-secondary/10 transition-all"
              >
                <Icons.close size={20} />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-primary/10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Sort Order */}
              <div>
                <label className="block text-sm font-semibold text-primary font-body mb-2">
                  Sort by Name
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className="w-full px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary"
                >
                  <option value="asc">Ascending (A-Z)</option>
                  <option value="desc">Descending (Z-A)</option>
                </select>
              </div>

              {/* Role Filter */}
              <div>
                <label className="block text-sm font-semibold text-primary font-body mb-2">
                  Role
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
                  className="w-full px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>

              {/* Provider Filter */}
              <div>
                <label className="block text-sm font-semibold text-primary font-body mb-2">
                  Provider
                </label>
                <select
                  value={providerFilter}
                  onChange={(e) => setProviderFilter(e.target.value as ProviderFilter)}
                  className="w-full px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary"
                >
                  <option value="all">All Providers</option>
                  <option value="google">Google</option>
                  <option value="apple">Apple</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-primary/10">
            <p className="text-sm text-secondary font-body">
              Showing <span className="font-semibold text-primary">{filteredAndSortedUsers.length}</span> of{' '}
              <span className="font-semibold text-primary">{users.length}</span> users
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body">Total Users</p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {users.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Icons.users size={24} className="text-accent" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body">
                  Google Users
                </p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {users.filter((u) => u.provider === 'google').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Icons.globe size={24} className="text-secondary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body">Apple Users</p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {users.filter((u) => u.provider === 'apple' || u.provider === 'ios').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Icons.phone size={24} className="text-accent" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body">
                  Active Today
                </p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {
                    users.filter((u) => {
                      const today = new Date();
                      const lastLogin = u.lastLogin.toDate();
                      return (
                        lastLogin.toDateString() === today.toDateString()
                      );
                    }).length
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Icons.check size={24} className="text-secondary" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-secondary/10 border border-secondary rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Icons.alert size={20} className="text-secondary" />
              <p className="text-secondary font-body">{error}</p>
            </div>
          </div>
        )}

        {/* Users Table - Only show if there are results OR if loading */}
        {(loading || filteredAndSortedUsers.length > 0) && (
          <Table
            data={filteredAndSortedUsers}
            columns={columns}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            loading={loading}
            getRowClassName={(user) => user.role === 'admin' ? 'bg-accent/5' : ''}
            isEditDisabled={(user) => user.role === 'admin'}
            isDeleteDisabled={(user) => user.role === 'admin'}
          />
        )}

        {/* No Results Message - Show when filters are active but no matches */}
        {!loading && filteredAndSortedUsers.length === 0 && users.length > 0 && (
          <div className="bg-white rounded-lg border border-primary/10 p-12 text-center">
            <Icons.search size={48} className="text-secondary/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">No users found</h3>
            <p className="text-secondary mb-4">
              No users match your current filters. Try adjusting your search or filters.
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* No Data Message - Show when database is truly empty */}
        {!loading && users.length === 0 && (
          <div className="bg-white rounded-lg border border-primary/10 p-12 text-center">
            <Icons.users size={48} className="text-secondary/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">No users yet</h3>
            <p className="text-secondary mb-4">
              There are no users in the system. Add your first user to get started.
            </p>
            <button
              onClick={handleAddUser}
              className="px-4 py-2 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all inline-flex items-center gap-2"
            >
              <Icons.plus size={20} />
              <span>Add User</span>
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, user: null })}
          onConfirm={handleDeleteConfirm}
          title="Delete User"
          message={`Are you sure you want to delete ${deleteModal.user?.name}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </AdminLayout>
  );
}
