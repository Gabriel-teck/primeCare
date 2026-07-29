"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { forgotPassword } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/api";
import { forgotPasswordSchema } from "@/lib/validation/auth";
import type { z } from "zod";

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgetPassword() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      await forgotPassword(data.email);
      toast.success(
        "If that email exists, a password reset link has been sent.",
      );
    } catch (err: unknown) {
      toast.error(
        getErrorMessage(err, "Failed to send reset email. Please try again."),
      );
    } finally {
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
            We&apos;ll email you a link to make a brand new password.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-4 space-y-4"
            noValidate
          >
            <div className="grid grid-cols-1">
              <div>
                <label className="block text-sm font-bold text-[#333]">
                  E-mail
                </label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="Enter Email"
                  disabled={isLoading}
                  autoComplete="email"
                  className={`bg-white w-full px-3 py-4 border focus:outline-none disabled:opacity-60 ${
                    errors.email ? "border-red-500" : ""
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
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
              {isLoading ? "Sending..." : "Continue"}
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
