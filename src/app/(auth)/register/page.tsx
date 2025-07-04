import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Register() {
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

            <div className="mt-4 space-y-4">
              {/* Name Fields */}
              <div>
                <label className="block text-sm font-bold text-[#333]">
                  Your name
                </label>
                <div className="grid grid-cols-2">
                  <div>
                    <input
                      name="firstName"
                      type="text"
                      placeholder="First Name"
                      className="bg-white w-full px-3 py-3 border focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      name="lastName"
                      type="text"
                      placeholder="Last Name"
                      className="bg-white w-full px-3 py-3 border focus:outline-none"
                    />
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
                    name="password"
                    type="email"
                    placeholder="Enter Email"
                    className="bg-white w-full px-3 py-3 border focus:outline-none"
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
                    className="bg-white w-full px-3 py-3 border focus:outline-none"
                  />
                </div>
              </div>

              {/*Confirm Password */}
              <div className="grid grid-cols-1">
                <div>
                  <label className="block text-sm font-bold text-[#333]">
                    Confirm Password
                  </label>
                  <input
                    name="password"
                    type="text"
                    placeholder="Confirm Password"
                    className="bg-white w-full px-3 py-3 border focus:outline-none"
                  />
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
                      type="text"
                      maxLength={2}
                      name="month"
                      placeholder="MM"
                      className="bg-white w-full px-3 py-3 border focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      maxLength={2}
                      name="day"
                      placeholder="DD"
                      className="bg-white w-full px-3 py-3 border focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="year"
                      maxLength={2}
                      name="day"
                      placeholder="YYYY"
                      className="bg-white w-full px-3 py-3 border focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-bold text-[#333]">
                  Gender
                </label>
                <div className="grid grid-cols-2">
                  <div className="bg-white w-full px-3 py-3 flex justify-center border">
                    <label className="flex items-center">
                      <input
                        name="gender"
                        type="radio"
                        className="w-4 h-4 text-green-600 border-gray-300"
                      />
                      <span className="ml-2 text-[#333]">Male</span>
                    </label>
                  </div>
                  <div className="bg-white w-full px-3 py-3 flex justify-center border">
                    <label className="flex items-center">
                      <input
                        name="gender"
                        type="radio"
                        className="w-4 h-4 text-green-600 border-gray-300"
                      />
                      <span className="ml-2 text-[#333]">female</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2">
                <input
                  name="acceptTerms"
                  type="checkbox"
                  className="w-4 h-4 text-green-600 border-green-300 rounded mt-1"
                />
                <label className="text-sm text-[#333]">
                  I have read and accept PrimeCare's{" "}
                  <Link href="#" className="text-green-500">Terms of Use </Link>and{" "}
                  <Link href="#" className="text-green-500">Privacy Policy</Link>.
                </label>
              </div>

              {/* Submit Button */}
              <Button
                size="xl"
                variant="default"
                className="w-full bg-green-600 text-white text-lg py-3 px-4 rounded-md hover:bg-green-700  disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Register
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
