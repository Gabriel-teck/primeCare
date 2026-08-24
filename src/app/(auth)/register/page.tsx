"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { registerUser } from "@/lib/api/auth";
import { checkEmailExists } from "@/lib/api/user";
import { getErrorMessage } from "@/lib/api";
import { registerSchema } from "@/lib/validation/auth";
import { PasswordInput } from "@/components/auth/PasswordInput";
import type { z } from "zod";

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError: setFormError,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      const exists = await checkEmailExists(data.email);
      if (exists) {
        setFormError("email", { message: "Email already exists" });
        toast.error("Email already registered");
        setIsLoading(false);
        return;
      }

      const fullName = `${data.firstName} ${data.lastName}`;
      await registerUser(data.email, fullName, data.password);

      toast.success("Account created. Please sign in.");
      router.push("/login");
    } catch (err: unknown) {
      toast.error(
        getErrorMessage(err, "Registration failed. Please try again."),
      );
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-[#f8f9fa]">
      <div className="max-w-md md:max-w-[600px] md:min-w-[300px] mx-auto px-4 py-16 md:py-24">
        <div className="p-4">
          {/* Title section */}
          <div className="text-left mb-4">
            <h1 className="text-[24px] text-black font-bold pb-1.5">
              Create an account
            </h1>
            <p className="text-[#16a34a] font-bold text-[14px]">
              Already have one?
              <Link href="/login" className="ml-0.5">
                Log in
              </Link>
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-4 space-y-4"
              noValidate
            >
              {/* Name Fields */}
              <div>
                <label className="block text-sm font-bold text-[#333]">
                  Your name
                </label>
                <div className="grid grid-cols-2">
                  <div>
                    <input
                      {...register("firstName")}
                      type="text"
                      placeholder="First Name"
                      className={`bg-white w-full px-3 py-3 border focus:outline-none ${
                        errors.firstName ? "border-red-500" : ""
                      }`}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      {...register("lastName")}
                      type="text"
                      placeholder="Last Name"
                      className={`bg-white w-full px-3 py-3 border focus:outline-none ${
                        errors.lastName ? "border-red-500" : ""
                      }`}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

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
                    className={`bg-white w-full px-3 py-3 border focus:outline-none ${
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
                  <PasswordInput
                    {...register("password")}
                    placeholder="Password"
                    autoComplete="new-password"
                    hasError={Boolean(errors.password)}
                    className="py-3"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              {/*Confirm Password */}
              <div className="grid grid-cols-1">
                <div>
                  <label className="block text-sm font-bold text-[#333]">
                    Confirm Password
                  </label>
                  <PasswordInput
                    {...register("confirmPassword")}
                    placeholder="Confirm Password"
                    autoComplete="new-password"
                    hasError={Boolean(errors.confirmPassword)}
                    className="py-3"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-bold text-[#333]">
                  Date of birth
                </label>
                <div className="grid grid-cols-3">
                  <div>
                    <input
                      {...register("month")}
                      type="text"
                      maxLength={2}
                      placeholder="MM"
                      className={`bg-white w-full px-3 py-3 border focus:outline-none ${
                        errors.month ? "border-red-500" : ""
                      }`}
                    />
                    {errors.month && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.month.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      {...register("day")}
                      type="text"
                      maxLength={2}
                      placeholder="DD"
                      className={`bg-white w-full px-3 py-3 border focus:outline-none ${
                        errors.day ? "border-red-500" : ""
                      }`}
                    />
                    {errors.day && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.day.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      {...register("year")}
                      type="text"
                      maxLength={4}
                      placeholder="YYYY"
                      className={`bg-white w-full px-3 py-3 border focus:outline-none ${
                        errors.year ? "border-red-500" : ""
                      }`}
                    />
                    {errors.year && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.year.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-bold text-[#333]">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    className={`bg-white w-full px-3 py-3 flex justify-center border ${
                      errors.gender ? "border-red-500" : ""
                    }`}
                  >
                    <label className="flex items-center">
                      <input
                        {...register("gender")}
                        type="radio"
                        value="male"
                        className="w-4 h-4 text-green-600 border-gray-300"
                      />
                      <span className="ml-2 text-[#333]">Male</span>
                    </label>
                  </div>
                  <div
                    className={`bg-white w-full px-3 py-3 flex justify-center border ${
                      errors.gender ? "border-red-500" : ""
                    }`}
                  >
                    <label className="flex items-center">
                      <input
                        {...register("gender")}
                        type="radio"
                        value="female"
                        className="w-4 h-4 text-green-600 border-gray-300"
                      />
                      <span className="ml-2 text-[#333]">Female</span>
                    </label>
                  </div>
                </div>
                {errors.gender && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.gender.message}
                  </p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2">
                <input
                  {...register("acceptTerms")}
                  type="checkbox"
                  className="w-4 h-4 text-green-600 border-green-300 rounded mt-1"
                />
                <label className="text-sm text-[#333]">
                  I have read and accept PrimeCare&apos;s{" "}
                  <Link href="#" className="text-green-500">
                    Terms of Use{" "}
                  </Link>
                  and{" "}
                  <Link href="#" className="text-green-500">
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>
              {errors.acceptTerms && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.acceptTerms.message}
                </p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                size="xl"
                variant="default"
                disabled={isLoading}
                className="w-full bg-green-600 text-white text-lg py-3 px-4 rounded-md hover:bg-green-700  disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? "Registering..." : "Register"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
