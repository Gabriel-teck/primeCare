import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type AdminStatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  className?: string;
};

export function AdminStatCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: AdminStatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-[#212529]">{value}</p>
          {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
        </div>
        <div className="rounded-lg bg-green-50 p-2 text-green-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
