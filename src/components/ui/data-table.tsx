import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "./empty-state";
import { TableSkeleton } from "./table-skeleton";
import { Pagination } from "./pagination";

export interface Column<T> {
  key: string;
  header: string;
  cell: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyState?: {
    icon: string;
    title: string;
    description: string;
    action?: React.ReactNode;
  };
  onRowClick?: (item: T) => void;
  getRowKey: (item: T) => string;
  pagination?: {
    itemsPerPage?: number;
    showPagination?: boolean;
  };
}

export function DataTable<T>({
  data,
  columns,
  loading,
  emptyState,
  onRowClick,
  getRowKey,
  pagination,
}: DataTableProps<T>) {
  const itemsPerPage = pagination?.itemsPerPage || 25;
  const showPagination = pagination?.showPagination !== false && data.length > itemsPerPage;
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPageState, setItemsPerPageState] = React.useState(itemsPerPage);

  // Calculate pagination
  const totalPages = Math.ceil(data.length / itemsPerPageState);
  const startIndex = (currentPage - 1) * itemsPerPageState;
  const endIndex = startIndex + itemsPerPageState;
  const paginatedData = showPagination ? data.slice(startIndex, endIndex) : data;

  // Reset to page 1 when data changes significantly
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [data.length, totalPages, currentPage]);

  if (loading) {
    return <TableSkeleton rows={5} columns={columns.length} />;
  }

  if (data.length === 0 && emptyState) {
    return (
      <EmptyState
        icon={emptyState.icon}
        title={emptyState.title}
        description={emptyState.description}
        action={emptyState.action}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item) => (
              <TableRow
                key={getRowKey(item)}
                className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {column.cell(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {showPagination && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPageState}
          totalItems={data.length}
          onItemsPerPageChange={setItemsPerPageState}
        />
      )}
    </div>
  );
}

