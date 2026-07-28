import { cn } from "@/lib/utils";

type AdminFilterBarProps = {
  children: React.ReactNode;
  className?: string;
  columns?: 2 | 3;
};

export function AdminFilterBar({
  children,
  className,
  columns = 2,
}: AdminFilterBarProps) {
  return (
    <div
      className={cn(
        "mb-4 grid grid-cols-1 items-end gap-3",
        columns === 3
          ? "sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_11rem_11rem]"
          : "sm:grid-cols-[minmax(0,1fr)_11rem]",
        className,
      )}
    >
      {children}
    </div>
  );
}
