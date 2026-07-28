import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  confirmed: "bg-green-50 text-green-700 border-green-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  rescheduled: "bg-purple-50 text-purple-700 border-purple-200",
  paid: "bg-green-50 text-green-700 border-green-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  refunded: "bg-gray-100 text-gray-700 border-gray-200",
  active: "bg-green-50 text-green-700 border-green-200",
  inactive: "bg-gray-100 text-gray-600 border-gray-200",
  published: "bg-green-50 text-green-700 border-green-200",
  draft: "bg-gray-100 text-gray-600 border-gray-200",
};

type AdminStatusBadgeProps = {
  status: string;
  className?: string;
};

export function AdminStatusBadge({ status, className }: AdminStatusBadgeProps) {
  const key = status.toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        statusStyles[key] ?? "bg-gray-100 text-gray-700 border-gray-200",
        className,
      )}
    >
      {status}
    </span>
  );
}
