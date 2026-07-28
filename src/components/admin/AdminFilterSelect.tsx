import { cn } from "@/lib/utils";

type Option = { label: string; value: string };

type AdminFilterSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  label?: string;
  className?: string;
};

export function AdminFilterSelect({
  value,
  onChange,
  options,
  label,
  className,
}: AdminFilterSelectProps) {
  return (
    <label className={cn("flex w-full flex-col gap-1 text-sm", className)}>
      {label ? (
        <span className="text-gray-600">{label}</span>
      ) : (
        <span className="invisible h-5">Filter</span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-[#212529] outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
