import { useState, useEffect } from 'react';
import { Search, Download, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface User {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  authProvider: 'phone' | 'google';
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  usersPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const ITEMS_PER_PAGE = 10;

export default function FacultyListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch users from API
  const fetchUsers = async (page: number, search: string = '') => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Please login to view faculty list');
        return;
      }

      const url = new URL(`${API_URL}/api/auth/users/all`);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('limit', ITEMS_PER_PAGE.toString());
      if (search) {
        url.searchParams.append('search', search);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }

      setUsers(data.data.users);
      setPagination(data.data.pagination);
    } catch (error: any) {
      console.error('Fetch users error:', error);
      toast.error(error.message || 'Failed to load faculty list');
      setUsers([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch users on component mount and when page/search changes
  useEffect(() => {
    fetchUsers(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  // Handle search with debounce
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Export CSV
  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Please login to export data');
        return;
      }

      // Fetch all users without pagination for export
      const response = await fetch(`${API_URL}/api/auth/users/all?limit=10000`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to export data');
      }

      const allUsers = data.data.users;

      // Create CSV content
      const headers = ['Name', 'Email', 'Phone', 'Auth Provider', 'Status', 'Joined Date'];
      const rows = allUsers.map((user: User) => [
        user.fullName,
        user.email || 'N/A',
        user.phone || 'N/A',
        user.authProvider === 'google' ? 'Google' : 'Phone',
        user.isActive ? 'Active' : 'Inactive',
        new Date(user.createdAt).toLocaleDateString('en-IN'),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `faculty_list_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success('CSV exported successfully');
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error.message || 'Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
            Faculty Directory
          </h1>
          <p className="text-muted-foreground mt-1">
            {pagination ? `${pagination.totalUsers} registered faculty members` : 'View all registered faculty members'}
          </p>
        </div>
        <Button
          onClick={handleExportCSV}
          disabled={isExporting || users.length === 0}
          variant="outline"
          className="border-primary text-primary hover:bg-primary/10"
        >
          {isExporting ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download size={18} className="mr-2" />
              Export CSV
            </>
          )}
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by name, email or phone..."
          className="pl-10"
        />
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : users.length > 0 ? (
        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="text-left py-4 px-6">Name</th>
                  <th className="text-left py-4 px-6">Email / Phone</th>
                  <th className="text-center py-4 px-6 hidden sm:table-cell">Auth Provider</th>
                  <th className="text-center py-4 px-6 hidden md:table-cell">Status</th>
                  <th className="text-right py-4 px-6 hidden lg:table-cell">Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr
                    key={user.id}
                    className="table-row animate-fade-in"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {user.fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-foreground">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-0.5">
                        {user.email && (
                          <span className="text-muted-foreground text-sm">{user.email}</span>
                        )}
                        {user.phone && (
                          <span className="text-muted-foreground text-sm">+91 {user.phone}</span>
                        )}
                        {!user.email && !user.phone && (
                          <span className="text-muted-foreground text-sm">N/A</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center hidden sm:table-cell">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${user.authProvider === 'google'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                        {user.authProvider === 'google' ? 'Google' : 'Phone'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center hidden md:table-cell">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${user.isActive
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right hidden lg:table-cell">
                      <span className="text-muted-foreground text-sm">
                        {formatDate(user.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {((pagination.currentPage - 1) * pagination.usersPerPage) + 1}-
                {Math.min(pagination.currentPage * pagination.usersPerPage, pagination.totalUsers)} of {pagination.totalUsers}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  <ChevronLeft size={16} />
                </Button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={currentPage === pageNum ? 'bg-primary' : ''}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          title="No faculty found"
          description={
            searchQuery
              ? 'Try adjusting your search query'
              : 'No faculty members registered yet'
          }
        />
      )}
    </div>
  );
}