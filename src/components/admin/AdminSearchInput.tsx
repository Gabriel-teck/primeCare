import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AdminSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
};

export function AdminSearchInput({
  value,
  onChange,
  placeholder = "Search...",
  label = "Search",
  className,
}: AdminSearchInputProps) {
  return (
    <label
      className={cn("flex w-full min-w-0 flex-col gap-1 text-sm", className)}
    >
      <span className="text-gray-600">{label}</span>
      <div className="relative w-full">
        <span className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-10 items-center justify-center text-gray-400">
          <Search aria-hidden className="h-4 w-4" />
        </span>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-white pl-10"
        />
      </div>
    </label>
  );
}
