import { Button } from "@/components/ui/button";

export default function Forgetpassword() {
  return (
    <section className="bg-[#f8f9fa] min-h-screen">
      <div className="max-w-md sm:max-w-[800px] sm:min-w-[300px] mt-8 px-4 py-6 sm:p-28 md:py-28">
        <div className=" p-4">
          {/* Title section */}
          <h1 className="text-2xl md:text-4xl text-black font-bold py-4">
            Create a new password
          </h1>
          <p className="text-sm text-[#212529] pb-6">
            We'll email you a link to make a brand new password.
          </p>

          <div className="mt-4 space-y-4">
            {/* Email */}
            <div className="grid grid-cols-1">
              <div>
                <label className="block text-sm font-bold text-[#333]">
                  E-mail
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="Enter Email"
                  className="bg-white w-full px-3 py-4 border focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              size="xl"
              variant="default"
              className="bg-green-600 text-white text-lg py-3 px-4 rounded-sm hover:bg-green-700  disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
