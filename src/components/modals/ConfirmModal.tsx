"use client";

import type { ReactNode } from "react";
import { AlertTriangle, Check, Loader2, Trash2, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type ConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Defaults to warning triangle. Pass null to hide. */
  icon?: ReactNode | null;
  variant?: "destructive" | "default";
  confirmLoading?: boolean;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  icon,
  variant = "destructive",
  confirmLoading = false,
  onConfirm,
}: ConfirmModalProps) {
  const resolvedIcon =
    icon === null
      ? null
      : (icon ?? (
          <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden />
        ));

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={cn(
          "w-[min(100%-2rem,20rem)] gap-5 rounded-xl border border-gray-200 bg-white p-5 shadow-none sm:max-w-xs",
        )}
      >
        <AlertDialogHeader className="gap-3 text-left sm:text-left">
          {resolvedIcon ? <div className="mb-1">{resolvedIcon}</div> : null}
          <AlertDialogTitle className="text-xl font-semibold text-[#212529]">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-gray-600">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex w-full flex-row gap-3 sm:justify-stretch">
          <AlertDialogCancel
            disabled={confirmLoading}
            className="mt-0 flex-1 cursor-pointer gap-2 rounded-full border border-gray-300 bg-white px-4 text-[#212529] shadow-none hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={confirmLoading}
            onClick={(e) => {
              e.preventDefault();
              void handleConfirm();
            }}
            className={cn(
              "flex-1 cursor-pointer gap-2 rounded-full px-4 shadow-none",
              variant === "destructive"
                ? "bg-red-600 text-white hover:bg-red-500"
                : "bg-green-700 text-white hover:bg-green-600",
            )}
          >
            {confirmLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-label="Loading" />
            ) : (
              <>
                {variant === "destructive" ? (
                  <Trash2 className="h-4 w-4" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                {confirmLabel}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
