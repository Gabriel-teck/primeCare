import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Column<T> = {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
};

type AdminDataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: React.ReactNode;
  loading?: boolean;
  className?: string;
};

export function AdminDataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  emptyMessage = "No results found.",
  loading = false,
  className,
}: AdminDataTableProps<T>) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-lg border border-gray-200 bg-white",
        className,
      )}
    >
      <div className="min-w-0">
        <table className="min-w-[640px] w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 font-medium whitespace-nowrap",
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  <Loader2
                    className="mx-auto h-8 w-8 animate-spin text-[#1d884a]"
                    aria-label="Loading"
                  />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "border-b border-gray-100 last:border-0",
                    onRowClick && "cursor-pointer hover:bg-green-50/40",
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-3 text-[#212529] align-middle",
                        col.className,
                      )}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
