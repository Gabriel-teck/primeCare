import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminEmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function AdminEmptyState({
  title,
  description,
  action,
  className,
}: AdminEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center",
        className,
      )}
    >
      <div className="mb-3 rounded-full bg-green-50 p-3 text-green-700">
        <Inbox className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-[#212529]">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-gray-600">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
