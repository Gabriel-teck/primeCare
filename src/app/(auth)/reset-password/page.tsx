"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { resetPassword } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/api";
import { resetPasswordSchema } from "@/lib/validation/auth";
import { PasswordInput } from "@/components/auth/PasswordInput";
import type { z } from "zod";

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error("Invalid reset link. Request a new password reset email.");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(token, data.password);
      toast.success("Password updated. You can now sign in.");
      router.replace("/login");
    } catch (err: unknown) {
      toast.error(
        getErrorMessage(
          err,
          "Could not reset password. The link may be invalid or expired.",
        ),
      );
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-[#f8f9fa] min-h-screen">
      <div className="max-w-md sm:max-w-[800px] sm:min-w-[300px] mt-8 px-4 py-6 sm:p-28 md:py-28">
        <div className="p-4">
          <h1 className="text-2xl md:text-4xl text-black font-bold py-4">
            Create a new password
          </h1>
          <p className="text-sm text-[#212529] pb-6">
            Set a brand new password.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-4 space-y-4"
            noValidate
          >
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#333]">
                  New Password
                </label>
                <PasswordInput
                  {...register("password")}
                  placeholder="New password"
                  disabled={isLoading}
                  autoComplete="new-password"
                  hasError={Boolean(errors.password)}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-[#333]">
                  Confirm Password
                </label>
                <PasswordInput
                  {...register("confirmPassword")}
                  placeholder="Confirm password"
                  disabled={isLoading}
                  autoComplete="new-password"
                  hasError={Boolean(errors.confirmPassword)}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              size="xl"
              variant="default"
              disabled={isLoading}
              className="bg-green-700 text-white text-lg py-3 px-4 rounded-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? "Saving..." : "Continue"}
            </Button>

            <div className="text-center mt-4">
              <Link
                href="/login"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                ← Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default function Resetpassword() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8f9fa]" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
