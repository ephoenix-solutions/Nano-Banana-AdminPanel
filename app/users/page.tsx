'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import ConfirmModal from '@/components/ConfirmModal';
import { Icons } from '@/config/icons';
import { User } from '@/lib/types/user.types';
import { getAllUsers, deleteUser } from '@/lib/services/user.service';
import { Timestamp } from 'firebase/firestore';

type SortField = 'name' | 'email' | 'role' | 'provider' | 'createdAt' | 'lastLogin';
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

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortOrder('asc');
    }
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

    // Sort by selected field
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
          break;
        case 'email':
          aValue = (a.email || '').toLowerCase();
          bValue = (b.email || '').toLowerCase();
          break;
        case 'role':
          aValue = (a.role || 'user').toLowerCase();
          bValue = (b.role || 'user').toLowerCase();
          break;
        case 'provider':
          aValue = (a.provider || '').toLowerCase();
          bValue = (b.provider || '').toLowerCase();
          break;
        case 'createdAt':
          aValue = a.createdAt?.toMillis() || 0;
          bValue = b.createdAt?.toMillis() || 0;
          break;
        case 'lastLogin':
          aValue = a.lastLogin?.toMillis() || 0;
          bValue = b.lastLogin?.toMillis() || 0;
          break;
        default:
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
      }

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
      roleFilter !== 'all' ||
      providerFilter !== 'all'
    );
  }, [searchQuery, roleFilter, providerFilter]);

  // Sortable header component with comprehensive focus prevention
  const SortableHeader = ({ field, label }: { field: SortField; label: string }) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Prevent default behavior
      e.preventDefault();
      // Immediately blur the button to prevent focus outline
      e.currentTarget.blur();
      // Remove focus from any active element
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      // Call the sort handler
      handleSort(field);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Prevent focus on mouse down
      e.preventDefault();
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
      // Prevent focus on pointer down (for touch devices)
      e.preventDefault();
    };

    return (
      <button
        type="button"
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onPointerDown={handlePointerDown}
        className="flex items-center gap-2 transition-all cursor-pointer group"
        style={{ outline: 'none', WebkitTapHighlightColor: 'transparent' }}
        tabIndex={-1}
      >
        <span>{label}</span>
        <div className="flex flex-col">
          <Icons.chevronUp
            size={16}
            className={`-mb-1 transition-all group-hover:scale-110 ${
              sortField === field && sortOrder === 'asc'
                ? 'text-accent'
                : 'text-secondary/30'
            }`}
          />
          <Icons.chevronDown
            size={16}
            className={`-mt-1 transition-all group-hover:scale-110 ${
              sortField === field && sortOrder === 'desc'
                ? 'text-accent'
                : 'text-secondary/30'
            }`}
          />
        </div>
      </button>
    );
  };

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
          <div className="flex flex-col md:flex-row gap-4">
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

            {/* Role Filter */}
            <div className="w-full md:w-40">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
                className="w-full px-3 py-2.5 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>

            {/* Provider Filter */}
            <div className="w-full md:w-40">
              <select
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value as ProviderFilter)}
                className="w-full px-3 py-2.5 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary"
              >
                <option value="all">All Providers</option>
                <option value="google">Google</option>
                <option value="apple">Apple</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-secondary/20 text-secondary rounded-lg font-semibold hover:bg-secondary/10 transition-all whitespace-nowrap"
              >
                <Icons.close size={20} />
                <span>Clear</span>
              </button>
            )}
          </div>

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

        {/* Users Table with Sortable Headers */}
        {loading ? (
          <div className="bg-white rounded-lg border border-primary/10 p-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
          </div>
        ) : filteredAndSortedUsers.length > 0 ? (
          <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background border-b border-primary/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      <SortableHeader field="name" label="Name" />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      <SortableHeader field="provider" label="Provider" />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      <SortableHeader field="role" label="Role" />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      Language
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      <SortableHeader field="createdAt" label="Created At" />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      <SortableHeader field="lastLogin" label="Last Login" />
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-primary font-body">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedUsers.map((user, index) => {
                    const editDisabled = user.role === 'admin';
                    const deleteDisabled = user.role === 'admin';
                    
                    return (
                      <tr
                        key={user.id}
                        className={`transition-colors ${
                          index % 2 === 0
                            ? 'bg-white hover:bg-background/50'
                            : 'bg-background hover:bg-background-200'
                        }`}
                      >
                        {/* Name Column */}
                        <td className="px-6 py-4 text-sm text-primary font-body">
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
                              <p className="font-semibold text-primary">{user.name}</p>
                              <p className="text-xs text-secondary">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Provider Column */}
                        <td className="px-6 py-4 text-sm text-primary font-body">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium capitalize ${
                              user.provider.toLowerCase() === 'google'
                                ? 'bg-accent-100 text-accent-700'
                                : user.provider.toLowerCase() === 'apple' || user.provider.toLowerCase() === 'ios'
                                ? 'bg-primary-100 text-primary-700'
                                : user.provider.toLowerCase() === 'manual'
                                ? 'bg-secondary-100 text-secondary-700'
                                : 'bg-accent/20 text-primary'
                            }`}
                          >
                            {user.provider}
                          </span>
                        </td>

                        {/* Role Column */}
                        <td className="px-6 py-4 text-sm text-primary font-body">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium capitalize ${
                              user.role === 'admin'
                                ? 'bg-secondary/20 text-secondary'
                                : 'bg-accent/20 text-primary'
                            }`}
                          >
                            {user.role || 'user'}
                          </span>
                        </td>

                        {/* Language Column */}
                        <td className="px-6 py-4 text-sm text-primary font-body">
                          <span className="uppercase text-sm font-medium">{user.language}</span>
                        </td>

                        {/* Created At Column */}
                        <td className="px-6 py-4 text-sm text-primary font-body">
                          <span className="text-sm">{formatTimestamp(user.createdAt)}</span>
                        </td>

                        {/* Last Login Column */}
                        <td className="px-6 py-4 text-sm text-primary font-body">
                          <span className="text-sm">{formatTimestamp(user.lastLogin)}</span>
                        </td>

                        {/* Actions Column */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleView(user)}
                              className="p-2 text-white bg-accent hover:bg-accent/90 rounded-md transition-all cursor-pointer"
                              title="View"
                            >
                              <Icons.eye size={18} />
                            </button>
                            <button
                              onClick={() => !editDisabled && handleEdit(user)}
                              disabled={editDisabled}
                              className="p-2 text-primary bg-background hover:bg-accent hover:text-primary rounded-md transition-all border border-primary/10 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-background"
                              title={editDisabled ? 'Cannot edit admin users' : 'Edit'}
                            >
                              <Icons.edit size={18} />
                            </button>
                            <button
                              onClick={() => !deleteDisabled && handleDeleteClick(user)}
                              disabled={deleteDisabled}
                              className="p-2 text-white bg-secondary hover:bg-secondary/90 rounded-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-secondary"
                              title={deleteDisabled ? 'Cannot delete admin users' : 'Delete'}
                            >
                              <Icons.trash size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

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
