"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

//zod validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters long"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError("");

    try {
      // Use the AuthContext login function which handles the API call
      await authLogin(data.email, data.password);

      // Redirect to dashboard or home page on success
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-[#f8f9fa] min-h-screen">
      <div className="max-w-md md:min-w-[300px] mx-auto px-4 py-16 md:py-28">
        <div className="p-4">
          {/* Title section */}
          <h1 className="text-2xl md:text-4xl text-center text-black font-bold py-4">
            Log in with email
          </h1>

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
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

            {/* Password */}
            <div className="grid grid-cols-1">
              <div>
                <label className="block text-sm font-bold text-[#333]">
                  Password
                </label>
                <input
                  {...register("password")}
                  type="password"
                  placeholder="Password"
                  className={`bg-white w-full px-3 py-4 border focus:outline-none ${
                    errors.password ? "border-red-500" : ""
                  }`}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="xl"
              variant="default"
              disabled={isLoading}
              className="w-full bg-green-600 text-white text-lg py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>

            <div className="flex flex-col space-y-4 justify-center items-center text-md">
              {/* Forget Password */}
              <Link
                href="/forget-password"
                className="text-green-500 font-bold"
              >
                Forget your Password ?
              </Link>

              {/* Sign up instead */}
              <Link href="/register" className="font-medium">
                Don't have an account?{" "}
                <span className="text-green-500 font-bold">Sign up</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
