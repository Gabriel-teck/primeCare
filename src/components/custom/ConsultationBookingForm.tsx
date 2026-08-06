"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import {
  bookConsultation,
  listConsultationDoctors,
} from "@/lib/api/consultation";
import type { ConsultationDoctor } from "@/types";

const schema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  reason: z.string().min(1, "Reason is required"),
  consultationType: z.enum(["Online Video Call", "Online Voice Call"], {
    required_error: "Consultation type is required",
  }),
  doctorId: z.string().optional(),
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
  const [doctors, setDoctors] = useState<ConsultationDoctor[]>([]);

  const {
    register,
    handleSubmit,
    reset,
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
      doctorId: "",
      consultationType: "Online Video Call",
    },
  });

  useEffect(() => {
    if (!token) return;
    listConsultationDoctors(token)
      .then(setDoctors)
      .catch(() => setDoctors([]));
  }, [token]);

  const onSubmit = async (data: FormData) => {
    setError("");
    setSuccess(false);
    try {
      await bookConsultation(
        { ...data, doctorId: data.doctorId || undefined },
        token,
        data.file?.[0],
      );
      setSuccess(true);
      reset({
        fullName: user?.fullName || "",
        email: user?.email || "",
        phoneNumber: "",
        date: "",
        time: "",
        reason: "",
        doctorId: "",
        consultationType: "Online Video Call",
        file: undefined,
      });
      setFileName("");
      if (onSuccess) onSuccess();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Booking failed");
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
        <h2 className="mb-2 text-xl font-bold">Book an Online Consultation</h2>
        <p className="mb-6 text-sm text-gray-500">
          Request an online video or voice visit. For clinic or follow-up
          visits, use Appointments instead.
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
          <label className="block font-medium mb-1">Consultation Type *</label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                {...register("consultationType")}
                type="radio"
                value="Online Video Call"
                className="accent-green-600"
              />
              <span className="font-medium">Online Video Call</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                {...register("consultationType")}
                type="radio"
                value="Online Voice Call"
                className="accent-green-600"
              />
              <span className="font-medium">Online Voice Call</span>
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            The type you choose is the call you&apos;ll start once confirmed.
          </p>
          {errors.consultationType && (
            <p className="text-red-500 text-xs mt-1">
              {errors.consultationType.message}
            </p>
          )}
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Preferred Doctor</label>
          <select
            {...register("doctorId")}
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="">No preference — assign for me</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.fullName}
                {doctor.specialty ? ` · ${doctor.specialty}` : ""}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Picking a doctor lets you start the call as soon as it is confirmed.
          </p>
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
            Reason for Online Consultation *
          </label>
          <textarea
            {...register("reason")}
            required
            rows={3}
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="Describe your symptoms, concerns, or reason for this online consultation..."
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
          {isSubmitting ? "Submitting..." : "Submit Online Consultation"}
        </Button>
        {success && (
          <div className="mt-4 text-center font-medium text-green-700">
            Online consultation request submitted!
          </div>
        )}
      </form>

      {/* Side Info Panels */}
      <div className="flex w-full flex-col gap-6 lg:w-80">
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="mb-2 flex items-center gap-2 font-semibold text-green-700">
            <Video className="h-5 w-5" />
            Online Consultations
          </div>
          <div className="text-sm">
            <div>
              Join a secure in-app video or voice call after confirmation —
              matching the type you book.
            </div>
            <div className="mt-2">
              Monday - Friday:{" "}
              <span className="font-medium">9:00 AM - 5:00 PM</span>
            </div>
            <div>
              Saturday: <span className="font-medium">9:00 AM - 2:00 PM</span>
            </div>
            <div>
              Sunday: <span className="font-medium">9:00 AM - 2:00 PM</span>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="mb-2 font-semibold">What to Expect</div>
          <ol className="list-inside list-decimal space-y-1 text-sm text-gray-700">
            <li>
              <span className="font-medium text-green-700">Submission:</span>{" "}
              Your online consultation request is submitted
            </li>
            <li>
              <span className="font-medium text-green-700">Confirmation:</span>{" "}
              You&apos;ll be able to start your booked call type once accepted
            </li>
            <li>
              <span className="font-medium text-green-700">Visit:</span> Join
              the call at your scheduled time
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
