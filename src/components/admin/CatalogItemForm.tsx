"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api/errors";
import { createCatalogItem, updateCatalogItem } from "@/lib/api/catalog";
import { resolveMediaUrl } from "@/lib/api/media";
import { cn } from "@/lib/utils";
import type { CatalogType } from "@/types";
import { toast } from "sonner";

export type CatalogFormValues = {
  type: CatalogType;
  name: string;
  description: string;
  price: string;
  currency: string;
  published: boolean;
  imageUrl?: string | null;
};

const TYPE_OPTIONS: { label: string; value: CatalogType }[] = [
  { label: "Specialty", value: "specialty" },
  { label: "Urgent care", value: "urgent_care" },
  { label: "Service", value: "service" },
];

const fieldClass =
  "h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-[#212529] shadow-none outline-none focus-visible:border-green-700 focus-visible:ring-1 focus-visible:ring-green-700";

const labelClass = "mb-1.5 block text-sm font-medium text-gray-600";

type CatalogItemFormProps = {
  mode: "create" | "edit";
  itemId?: string;
  initialValues?: Partial<CatalogFormValues>;
};

export function CatalogItemForm({
  mode,
  itemId,
  initialValues,
}: CatalogItemFormProps) {
  const router = useRouter();
  const { token } = useAuth();
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [values, setValues] = useState<CatalogFormValues>({
    type: initialValues?.type || "specialty",
    name: initialValues?.name || "",
    description: initialValues?.description || "",
    price:
      initialValues?.price != null && initialValues.price !== ""
        ? String(initialValues.price)
        : "",
    currency: initialValues?.currency || "NGN",
    published: initialValues?.published ?? false,
    imageUrl: initialValues?.imageUrl ?? null,
  });

  const isService = values.type === "service";
  const isSpecialty = values.type === "specialty";
  const title = mode === "create" ? "Add catalog item" : "Edit catalog item";
  const subtitle =
    mode === "create"
      ? "Create a specialty, urgent-care condition, or service."
      : "Update this catalog item’s details and visibility.";

  const typeHint = useMemo(() => {
    if (values.type === "specialty") {
      return "Specialties appear on the landing page and in doctor specialty lists. An image is required.";
    }
    if (values.type === "urgent_care") {
      return "Urgent-care items describe conditions patients can book for.";
    }
    return "Services include pricing shown in care and billing flows.";
  }, [values.type]);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const displayImage =
    previewUrl || (values.imageUrl ? resolveMediaUrl(values.imageUrl) : null);

  const setField = <K extends keyof CatalogFormValues>(
    key: K,
    value: CatalogFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const onCancel = () => {
    router.push("/admin-dashboard/catalog");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Not authenticated");
      return;
    }
    if (isService && (!values.price || Number(values.price) < 0)) {
      toast.error("Enter a valid service price");
      return;
    }
    if (isSpecialty) {
      const hasImage = Boolean(imageFile) || Boolean(values.imageUrl);
      if (!hasImage) {
        toast.error("Specialty items require an image");
        return;
      }
    }

    const payload = {
      name: values.name.trim(),
      type: values.type,
      description: values.description.trim(),
      published: values.published,
      currency: isService ? values.currency : "NGN",
      price: isService ? Number(values.price) : null,
      image: imageFile,
    };

    setSaving(true);
    try {
      if (mode === "edit") {
        if (!itemId) throw new Error("Missing catalog item id");
        await updateCatalogItem(itemId, payload, token);
        toast.success("Catalog item updated");
      } else {
        await createCatalogItem(payload, token);
        toast.success("Catalog item created");
      }
      router.push("/admin-dashboard/catalog");
    } catch (err) {
      toast.error(
        getErrorMessage(err) ||
          (mode === "edit"
            ? "Could not update catalog item"
            : "Could not create catalog item"),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <p className="mb-3 text-sm text-gray-500">
        <Link href="/admin-dashboard/catalog" className="hover:text-green-700">
          Catalog
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-[#212529]">
          {mode === "create" ? "Add item" : "Edit item"}
        </span>
      </p>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="-ml-2 mb-4 cursor-pointer gap-2 text-gray-700 hover:bg-green-50 hover:text-green-700"
        onClick={onCancel}
        disabled={saving}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <form
        onSubmit={(e) => void onSubmit(e)}
        className="rounded-xl border border-gray-200 bg-white p-5 shadow-none sm:p-6"
      >
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#212529] sm:text-2xl">
              {title}
            </h1>
            <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 self-start rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 shadow-none">
            <span>Published</span>
            <input
              type="checkbox"
              checked={values.published}
              onChange={(e) => setField("published", e.target.checked)}
              className="h-4 w-4 cursor-pointer accent-green-700"
              disabled={saving}
            />
          </label>
        </div>

        <p className="mb-4 text-xs text-gray-500">{typeHint}</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="catalog-type" className={labelClass}>
              Type <span className="text-red-600">*</span>
            </label>
            <select
              id="catalog-type"
              value={values.type}
              onChange={(e) => setField("type", e.target.value as CatalogType)}
              className={cn(fieldClass, "cursor-pointer")}
              required
              disabled={saving}
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="catalog-name" className={labelClass}>
              {values.type === "specialty"
                ? "Specialty name"
                : values.type === "urgent_care"
                  ? "Condition name"
                  : "Service name"}{" "}
              <span className="text-red-600">*</span>
            </label>
            <Input
              id="catalog-name"
              value={values.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder={
                values.type === "specialty"
                  ? "e.g. Cardiology"
                  : values.type === "urgent_care"
                    ? "e.g. High fever"
                    : "e.g. Video consultation"
              }
              className={cn(fieldClass, "shadow-none")}
              required
              disabled={saving}
            />
          </div>

          {isService ? (
            <>
              <div>
                <label htmlFor="catalog-price" className={labelClass}>
                  Price <span className="text-red-600">*</span>
                </label>
                <Input
                  id="catalog-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={values.price}
                  onChange={(e) => setField("price", e.target.value)}
                  placeholder="0.00"
                  className={cn(fieldClass, "shadow-none")}
                  required
                  disabled={saving}
                />
              </div>
              <div>
                <label htmlFor="catalog-currency" className={labelClass}>
                  Currency <span className="text-red-600">*</span>
                </label>
                <select
                  id="catalog-currency"
                  value={values.currency}
                  onChange={(e) => setField("currency", e.target.value)}
                  className={cn(fieldClass, "cursor-pointer")}
                  required
                  disabled={saving}
                >
                  <option value="NGN">NGN</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </>
          ) : null}

          {isSpecialty ? (
            <div className="sm:col-span-2">
              <label htmlFor="catalog-image" className={labelClass}>
                Specialty image <span className="text-red-600">*</span>
              </label>
              <Input
                id="catalog-image"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                className={cn(
                  fieldClass,
                  "cursor-pointer py-1.5 file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-green-50 file:px-3 file:py-1 file:text-sm file:font-medium file:text-green-800 shadow-none",
                )}
                required={mode === "create" || !values.imageUrl}
                disabled={saving}
              />
              {displayImage ? (
                // eslint-disable-next-line @next/next/no-img-element -- preview of local/uploaded specialty image
                <img
                  src={displayImage}
                  alt="Specialty preview"
                  className="mt-3 h-24 w-24 rounded object-cover border border-gray-200"
                />
              ) : null}
            </div>
          ) : null}

          <div className="sm:col-span-2">
            <label htmlFor="catalog-description" className={labelClass}>
              Description <span className="text-red-600">*</span>
            </label>
            <textarea
              id="catalog-description"
              value={values.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder={
                values.type === "service"
                  ? "Describe what this service includes…"
                  : values.type === "urgent_care"
                    ? "Describe the urgent-care condition…"
                    : "Describe this specialty…"
              }
              rows={5}
              className={cn(
                fieldClass,
                "h-auto min-h-[120px] resize-y py-2 shadow-none",
              )}
              required
              disabled={saving}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer gap-2 rounded-2xl border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={onCancel}
            disabled={saving}
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="cursor-pointer gap-2 rounded-2xl bg-green-700 text-white hover:bg-green-600"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {mode === "create" ? "Create item" : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
