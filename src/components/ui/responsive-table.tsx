'use client';

import { ReactNode, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  minWidth?: string;
  render?: (value: any, row: any) => ReactNode;
  mobileRender?: (value: any, row: any) => ReactNode;
  hideOnMobile?: boolean;
  priority?: number; // Higher priority columns stay visible longer on mobile
}

interface ResponsiveTableProps {
  data: any[];
  columns: Column[];
  loading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize?: number;
  };
  searchable?: boolean;
  filterable?: boolean;
  onSearch?: (query: string) => void;
  onFilter?: () => void;
  emptyMessage?: string;
  mobileCardView?: boolean;
}

export function ResponsiveTable({
  data,
  columns,
  loading = false,
  pagination,
  searchable = false,
  filterable = false,
  onSearch,
  onFilter,
  emptyMessage = 'Nenhum item encontrado',
  mobileCardView = true
}: ResponsiveTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  // Sort columns by priority for mobile
  const priorityColumns = columns
    .filter(col => !col.hideOnMobile)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  const visibleColumns = priorityColumns.slice(0, 3); // Show max 3 columns on mobile
  const hiddenColumns = priorityColumns.slice(3);

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded"></div>
        ))}
      </div>
    </div>;
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      {(searchable || filterable) && (
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full pl-10 pr-4 py-2 border rounded-md text-sm"
                style={{ 
                  borderColor: 'var(--border)',
                  background: 'var(--background)'
                }}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          )}
          {filterable && (
            <button
              onClick={onFilter}
              className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium transition-colors"
              style={{ 
                borderColor: 'var(--border)',
                color: 'var(--foreground)'
              }}
            >
              <Filter className="h-4 w-4" />
              Filtros
            </button>
          )}
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y" style={{ borderColor: 'var(--border)' }}>
          <thead style={{ background: 'var(--muted)' }}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-opacity-75' : ''
                  }`}
                  style={{ 
                    color: 'var(--muted-foreground)',
                    width: column.width,
                    minWidth: column.minWidth
                  }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.label}
                    {column.sortable && sortColumn === column.key && (
                      <span className={sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}>
                        ↑
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ 
            background: 'var(--card)', 
            borderColor: 'var(--border)' 
          }}>
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-opacity-50 transition-colors">
                {columns.map((column) => (
                  <td 
                    key={column.key} 
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      {mobileCardView && (
        <div className="lg:hidden space-y-3">
          {data.map((row, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border"
              style={{ 
                background: 'var(--card)',
                borderColor: 'var(--border)'
              }}
            >
              <div className="space-y-2">
                {visibleColumns.map((column) => (
                  <div key={column.key} className="flex justify-between items-start">
                    <span className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                      {column.label}:
                    </span>
                    <span className="text-sm text-right flex-1 ml-2" style={{ color: 'var(--foreground)' }}>
                      {column.mobileRender 
                        ? column.mobileRender(row[column.key], row)
                        : column.render 
                        ? column.render(row[column.key], row) 
                        : row[column.key]
                      }
                    </span>
                  </div>
                ))}
                
                {hiddenColumns.length > 0 && (
                  <details className="mt-3">
                    <summary className="text-sm cursor-pointer" style={{ color: 'var(--primary)' }}>
                      Ver mais detalhes
                    </summary>
                    <div className="mt-2 space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                      {hiddenColumns.map((column) => (
                        <div key={column.key} className="flex justify-between items-start">
                          <span className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                            {column.label}:
                          </span>
                          <span className="text-sm text-right flex-1 ml-2" style={{ color: 'var(--foreground)' }}>
                            {column.mobileRender 
                              ? column.mobileRender(row[column.key], row)
                              : column.render 
                              ? column.render(row[column.key], row) 
                              : row[column.key]
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mobile Table View (Alternative) */}
      {!mobileCardView && (
        <div className="lg:hidden overflow-x-auto">
          <table className="min-w-full divide-y" style={{ borderColor: 'var(--border)' }}>
            <thead style={{ background: 'var(--muted)' }}>
              <tr>
                {visibleColumns.map((column) => (
                  <th
                    key={column.key}
                    className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ 
              background: 'var(--card)', 
              borderColor: 'var(--border)' 
            }}>
              {data.map((row, index) => (
                <tr key={index}>
                  {visibleColumns.map((column) => (
                    <td 
                      key={column.key} 
                      className="px-3 py-2 text-sm"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {data.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Página {pagination.currentPage} de {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className="p-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                borderColor: 'var(--border)',
                color: 'var(--foreground)'
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {/* Page numbers - show less on mobile */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => pagination.onPageChange(page)}
                  className={`px-3 py-1 text-sm rounded-md ${
                    page === pagination.currentPage 
                      ? 'font-medium' 
                      : 'hover:bg-opacity-75'
                  }`}
                  style={{ 
                    background: page === pagination.currentPage ? 'var(--primary)' : 'transparent',
                    color: page === pagination.currentPage ? 'var(--primary-foreground)' : 'var(--foreground)',
                  }}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="p-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                borderColor: 'var(--border)',
                color: 'var(--foreground)'
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}