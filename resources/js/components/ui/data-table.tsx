import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, MoreHorizontal, Search } from 'lucide-react';
import * as React from 'react';
import type { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Unified Column interface supporting both patterns
export interface Column<T> {
  // Primary identifiers (support both patterns)
  key?: keyof T;
  accessor?: keyof T;

  // Labels
  label?: string;
  header?: string;

  // Rendering
  render?: (row: T) => React.ReactNode;
  cell?: (row: T) => React.ReactNode;

  // Features
  sortable?: boolean;
  className?: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

// Row actions interface
export interface RowAction<T> {
  label: string;
  icon?: LucideIcon;
  onClick: (row: T) => void;
  variant?: 'default' | 'destructive';
  disabled?: (row: T) => boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: (row: T) => RowAction<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  pagination?: {
    currentPage: number;
    lastPage: number;
    total: number;
    perPage: number;
    onPageChange?: (page: number) => void;
  };
  emptyMessage?: string;
  headerActions?: React.ReactNode;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  actions,
  searchable = false,
  searchPlaceholder = 'Cari...',
  onSearch,
  pagination,
  emptyMessage = 'Tidak ada data tersedia.',
  headerActions,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const handlePageChange = (page: number) => {
    if (pagination?.onPageChange) {
      pagination.onPageChange(page);
    } else {
      // Default behavior: use Inertia router
      router.get(
        window.location.pathname,
        { page },
        { preserveState: true, preserveScroll: true }
      );
    }
  };

  // Get column label (support both patterns)
  const getColumnLabel = (column: Column<T>): string => {
    return column.label || column.header || '';
  };

  // Get column key (support both patterns)
  const getColumnKey = (column: Column<T>): keyof T | undefined => {
    return column.key || column.accessor;
  };

  // Render cell content
  const renderCell = (column: Column<T>, row: T): React.ReactNode => {
    // Use render or cell function if provided
    if (column.render) return column.render(row);
    if (column.cell) return column.cell(row);

    // Otherwise use key/accessor
    const key = getColumnKey(column);
    if (key) {
      return String(row[key] ?? '');
    }

    return '';
  };

  return (
    <div className="w-full space-y-4">
      {(searchable || headerActions) && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {searchable && (
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={handleSearch}
                className="pl-9"
              />
            </div>
          )}
          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
        </div>
      )}

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className={column.className}>
                  {getColumnLabel(column)}
                </TableHead>
              ))}
              {actions && <TableHead className="w-[70px]">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex} className={column.className}>
                      {renderCell(column, row)}
                    </TableCell>
                  ))}
                  {actions && typeof actions === 'function' && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="size-8 p-0">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Buka menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions(row).map((action, actionIndex) => {
                            const Icon = action.icon;
                            const isDisabled =
                              action.disabled && action.disabled(row);
                            return (
                              <DropdownMenuItem
                                key={actionIndex}
                                onClick={() => !isDisabled && action.onClick(row)}
                                disabled={isDisabled}
                                className={
                                  action.variant === 'destructive'
                                    ? 'text-destructive focus:text-destructive'
                                    : ''
                                }
                              >
                                {Icon && <Icon className="mr-2 size-4" />}
                                {action.label}
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.lastPage > 1 && (
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Menampilkan{' '}
            {Math.min((pagination.currentPage - 1) * pagination.perPage + 1, pagination.total)}{' '}
            sampai {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} dari{' '}
            {pagination.total} data
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
            >
              <ChevronLeft className="size-4" />
              Sebelumnya
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.lastPage) }, (_, i) => {
                let pageNum: number;
                if (pagination.lastPage <= 5) {
                  pageNum = i + 1;
                } else if (pagination.currentPage <= 3) {
                  pageNum = i + 1;
                } else if (pagination.currentPage >= pagination.lastPage - 2) {
                  pageNum = pagination.lastPage - 4 + i;
                } else {
                  pageNum = pagination.currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="size-9 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.lastPage}
            >
              Selanjutnya
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
