"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { forgotPassword } from "@/lib/api/auth";

//zod validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      console.log("🔍 Forget Password: Submitting email:", data.email);

      // Call the forgot password API
      const response = await forgotPassword(data.email);
      console.log("🔍 Forget Password: API response:", response);

      // Show success message
      setSuccess(true);
    } catch (err: any) {
      console.log("🔍 Forget Password: Error:", err);
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-[#f8f9fa] min-h-screen">
      <div className="max-w-md sm:max-w-[800px] sm:min-w-[300px] mt-8 px-4 py-6 sm:p-28 md:py-28">
        <div className="p-4">
          {/* Title section */}
          <h1 className="text-2xl md:text-4xl text-black font-bold py-4">
            Create a new password
          </h1>
          <p className="text-sm text-[#212529] pb-6">
            We'll email you a link to make a brand new password.
          </p>

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              <p className="font-bold">Reset email sent!</p>
              <p className="text-sm mt-1">
                If an account with that email exists, we've sent you a password
                reset link. Please check your email and follow the instructions.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
            {/* Email */}
            <div className="grid grid-cols-1">
              <div>
                <label className="block text-sm font-bold text-[#333]">
                  E-mail
                </label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="Enter Email"
                  className={`bg-white w-full px-3 py-4 border focus:outline-none ${
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

            {/* Submit Button */}
            <Button
              type="submit"
              size="xl"
              variant="default"
              disabled={isLoading || success}
              className="bg-green-700 text-white text-lg py-3 px-4 rounded-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? "Sending..." : "Continue"}
            </Button>

            {/* Back to login */}
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
