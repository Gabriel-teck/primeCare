import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Login() {
  return (
    <section className="bg-[#f8f9fa] min-h-screen">
      <div className="max-w-md md:min-w-[300px] mx-auto px-4 py-16 md:py-28">
        <div className="p-4">
          {/* Title section */}
          <h1 className="text-2xl md:text-4xl text-center text-black font-bold py-4">
            Log in with email
          </h1>

          <div className="mt-4 space-y-4">
            {/* Email */}
            <div className="grid grid-cols-1">
              <div>
                <label className="block text-sm font-bold text-[#333]">
                  E-mail
                </label>
                <input
                  name="password"
                  type="email"
                  placeholder="Enter Email"
                  className="bg-white w-full px-3 py-4 border focus:outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1">
              <div>
                <label className="block text-sm font-bold text-[#333]">
                  Password
                </label>
                <input
                  name="password"
                  type="text"
                  placeholder="Password"
                  className="bg-white w-full px-3 py-4 border focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              size="xl"
              variant="default"
              className="w-full bg-green-600 text-white text-lg py-3 px-4 rounded-md hover:bg-green-700  disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Sign in
            </Button>

            <div className="flex flex-col space-y-4 justify-center items-center text-md">
              {/* Forget Password */}
              <Link
                href="/forget-password"
                className="text-green-500 font-bold"
              >
                Forget your Password ?
              </Link>

              {/* Signu instead */}
              <Link href="/register" className="font-medium">
                Don't have an account?{" "}
                <span className="text-green-500 font-bold">Sign up</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
