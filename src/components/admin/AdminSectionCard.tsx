import { cn } from "@/lib/utils";

type AdminSectionCardProps = {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function AdminSectionCard({
  title,
  description,
  actions,
  children,
  className,
}: AdminSectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5",
        className,
      )}
    >
      {(title || actions) && (
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title ? (
              <h2 className="text-base font-semibold text-[#212529]">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="text-sm text-gray-600">{description}</p>
            ) : null}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
