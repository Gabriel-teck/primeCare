"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, Video } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import { bookConsultation } from "@/lib/api/consultation";

const schema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  reason: z.string().min(1, "Reason is required"),
  consultationType: z.string().min(1, "Consultation type is required"),
  file: z.any().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ConsultationBookingForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const { user, token } = useAuth();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phoneNumber: "",
      date: "",
      time: "",
      reason: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    setSuccess(false);
    try {
      await bookConsultation(data, token, data.file?.[0]);
      setSuccess(true);
      reset({
        fullName: user?.fullName || "",
        email: user?.email || "",
        phoneNumber: "",
        date: "",
        time: "",
        reason: "",
        file: undefined,
      });
      setFileName("");
      if (onSuccess) onSuccess();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Booking failed");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 bg-white rounded-lg shadow p-6"
        autoComplete="off"
      >
        <h2 className="text-xl font-bold mb-2">Book a Consultation</h2>
        <p className="text-gray-500 mb-6 text-sm">
          Please fill out the form below to request an online video consultation
        </p>
        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label className="block font-medium mb-1">Full Name *</label>
          <Input
            {...register("fullName")}
            required
            placeholder="Enter your full name"
          />
          {errors.fullName && (
            <p className="text-red-500 text-xs mt-1">
              {errors.fullName.message}
            </p>
          )}
        </div>
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Email Address *</label>
            <Input
              {...register("email")}
              required
              type="email"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label className="block font-medium mb-1">Phone Number *</label>
            <Input
              {...register("phoneNumber")}
              required
              placeholder="Enter your phone number"
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Consultation Type</label>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <input
                {...register("consultationType")}
                type="radio"
                value="Online Video Call"
                checked
                readOnly
                className="accent-green-600"
              />
              <span className="ml-2 font-medium">Online Video Call</span>
            </div>
            <span className="text-xs text-gray-500">
              A Google Meet link will be sent upon confirmation
            </span>
          </div>
          {errors.consultationType && (
            <p className="text-red-500 text-xs mt-1">
              {errors.consultationType.message}
            </p>
          )}
        </div>
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Preferred Date *</label>
            <Input {...register("date")} type="date" required />
            {errors.date && (
              <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>
            )}
          </div>
          <div>
            <label className="block font-medium mb-1">Preferred Time *</label>
            <Input {...register("time")} type="time" required />
            {errors.time && (
              <p className="text-red-500 text-xs mt-1">{errors.time.message}</p>
            )}
          </div>
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">
            Reason for Consultation *
          </label>
          <textarea
            {...register("reason")}
            required
            rows={3}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="Describe your symptoms, concerns, or reason for this consultation..."
          />
          {errors.reason && (
            <p className="text-red-500 text-xs mt-1">{errors.reason.message}</p>
          )}
        </div>
        <div className="mb-6">
          <label className="block font-medium mb-1">
            Attach Medical File / Lab Results
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            {...register("file")}
            onChange={(e) => {
              // setValue("file", e.target.files);
              setFileName(e.target.files?.[0]?.name || "");
            }}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
          {fileName && (
            <div className="mt-2 text-xs text-gray-600">
              Attached: {fileName}
            </div>
          )}
        </div>
        <Button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Consultation Request"}
        </Button>
        {success && (
          <div className="mt-4 text-green-700 text-center font-medium">
            Consultation request submitted!
          </div>
        )}
      </form>

      {/* Side Info Panels */}
      <div className="flex flex-col gap-6 w-full lg:w-80">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-2 text-green-700 font-semibold">
            <Video className="h-5 w-5" />
            Online Video Consultations
          </div>
          <div className="text-sm">
            <div>Google Meet link will be sent after confirmation.</div>
            <div className="mt-2">
              Monday - Friday:{" "}
              <span className="font-medium">9:00 AM - 5:00 PM</span>
            </div>
            <div>
              Saturday: <span className="font-medium">9:00 AM - 2:00 PM</span>
            </div>
            <div>
              Sunday: <span className="font-medium">Closed</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="font-semibold mb-2">What to Expect</div>
          <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
            <li>
              <span className="font-medium text-green-700">Submission:</span>{" "}
              Your consultation request is submitted
            </li>
            <li>
              <span className="font-medium text-green-700">Confirmation:</span>{" "}
              You'll receive a Google Meet link upon acceptance
            </li>
            <li>
              <span className="font-medium text-green-700">Consultation:</span>{" "}
              Join the video call at your scheduled time
            </li>
          </ol>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="font-semibold mb-2">Need Help?</div>
          <div className="text-sm">
            <div>
              <span className="font-medium">Emergency:</span> (+234) 807 042
              9049
            </div>
            <div>
              <span className="font-medium">General Inquiries:</span> (+234) 807
              042 9049
            </div>
            <div>
              <span className="font-medium">Email:</span>{" "}
              consultations@primecare.com
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
