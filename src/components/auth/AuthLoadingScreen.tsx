"use client";

import { Loader2 } from "lucide-react";

/** Silent full-viewport placeholder while auth resolves — no status copy. */
export function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <Loader2
        className="h-8 w-8 animate-spin text-[#1d884a]"
        aria-label="Loading"
      />
    </div>
  );
}
