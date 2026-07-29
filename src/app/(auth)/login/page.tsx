"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth, dashboardForRole } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api";
import { loginSchema } from "@/lib/validation/auth";
import { PasswordInput } from "@/components/auth/PasswordInput";
import type { z } from "zod";

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const loggedInUser = await authLogin(data.email, data.password);
      toast.success("Welcome back");
      router.replace(dashboardForRole(loggedInUser.role));
    } catch (err: unknown) {
      toast.error(
        getErrorMessage(err, "Login failed. Please check your credentials."),
      );
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-[#f8f9fa] min-h-screen">
      <div className="max-w-md md:min-w-[300px] mx-auto px-4 py-16 md:py-28">
        <div className="p-4">
          <h1 className="text-2xl md:text-4xl text-center text-black font-bold py-4">
            Log in with email
          </h1>

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

            <div className="grid grid-cols-1">
              <div>
                <label className="block text-sm font-bold text-[#333]">
                  Password
                </label>
                <PasswordInput
                  {...register("password")}
                  placeholder="Password"
                  disabled={isLoading}
                  autoComplete="current-password"
                  hasError={Boolean(errors.password)}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              size="xl"
              variant="default"
              disabled={isLoading}
              className="w-full bg-green-600 text-white text-lg py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </Button>

            <div className="flex flex-col space-y-4 justify-center items-center text-md">
              <Link
                href="/forget-password"
                className={`text-green-500 font-bold ${isLoading ? "pointer-events-none opacity-50" : ""}`}
              >
                Forget your Password ?
              </Link>

              <Link
                href="/register"
                className={`font-medium ${isLoading ? "pointer-events-none opacity-50" : ""}`}
              >
                Don&apos;t have an account?{" "}
                <span className="text-green-500 font-bold">Sign up</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
