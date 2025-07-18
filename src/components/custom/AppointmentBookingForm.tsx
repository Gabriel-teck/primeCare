"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { bookAppointment } from "@/lib/api/appointment";
import { useAuth } from "@/context/AuthContext";
import { Calendar } from "lucide-react";

const schema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(7, "Phone number is required"),
  appointmentType: z.string().min(1, "Appointment type is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  reason: z.string().min(1, "Reason is required"),
});

type FormData = z.infer<typeof schema>;

export default function AppointmentBookingForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const { user, token } = useAuth();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
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
      appointmentType: "",
      date: "",
      time: "",
      reason: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    setSuccess(false);
    try {
      await bookAppointment(data, token);
      setSuccess(true);
      reset();
      if (onSuccess) onSuccess(); // Switch tab on success
    } catch (err: any) {
      setError(err.message || "Booking failed");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main Form */}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {success && <div className="text-green-600">Appointment booked!</div>}
        {error && <div className="text-red-600">{error}</div>}

        <div>
          <label className="block font-medium">Full Name</label>
          <input
            type="text"
            {...register("fullName")}
            className="bg-white w-full px-3 py-2 border rounded focus:outline-none"
          />
          {errors.fullName && (
            <p className="text-red-500">{errors.fullName.message}</p>
          )}
        </div>
        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            {...register("email")}
            className="bg-white w-full px-3 py-2 border rounded focus:outline-none"
          />
          {errors.email && (
            <p className="text-red-500">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="block font-medium">Phone Number</label>
          <input
            type="tel"
            {...register("phoneNumber")}
            className="bg-white w-full px-3 py-2 border rounded focus:outline-none"
          />
          {errors.phoneNumber && (
            <p className="text-red-500">{errors.phoneNumber.message}</p>
          )}
        </div>
        <div>
          <label className="block font-medium mb-1">Appointment Type</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="consultation"
                {...register("appointmentType")}
                defaultChecked
                className="mr-2"
              />
              Consultation
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="follow-up"
                {...register("appointmentType")}
                className="mr-2"
              />
              Follow-up
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="routine"
                {...register("appointmentType")}
                className="mr-2"
              />
              Routine
            </label>
          </div>
          {errors.appointmentType && (
            <p className="text-red-500">{errors.appointmentType.message}</p>
          )}
        </div>
        <div>
          <label className="block font-medium">Date</label>
          <input
            type="date"
            {...register("date")}
            className="bg-white w-full px-3 py-2 border rounded focus:outline-none"
          />
          {errors.date && <p className="text-red-500">{errors.date.message}</p>}
        </div>
        <div>
          <label className="block font-medium">Time</label>
          <input
            type="time"
            {...register("time")}
            className="bg-white w-full px-3 py-2 border rounded focus:outline-none"
          />
          {errors.time && <p className="text-red-500">{errors.time.message}</p>}
        </div>
        <div>
          <label className="block font-medium">Reason</label>
          <input
            type="text"
            {...register("reason")}
            className="bg-white w-full px-3 py-2 border rounded focus:outline-none"
          />
          {errors.reason && (
            <p className="text-red-500">{errors.reason.message}</p>
          )}
        </div>
        <button
          type="submit"
          className="bg-green-700 text-white px-4 py-2 rounded"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Booking..." : "Book Appointment"}
        </button>
      </form>

      {/* <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 bg-white rounded-lg shadow p-6"
        autoComplete="off"
      >
        {success && <div className="text-green-600">Appointment booked!</div>}
        {error && <div className="text-red-600">{error}</div>}
        <h2 className="text-xl font-bold mb-2">Appointment Details</h2>
        <p className="text-gray-500 mb-6 text-sm">
          Please fill out the form below to request an appointment
        </p>
        <div className="mb-4">
          <label className="block font-medium mb-1">Full Name *</label>
          <Input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
            placeholder="Enter your full name"
          />
        </div>
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Email Address *</label>
            <Input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Phone Number *</label>
            <Input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="Enter your phone number"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Appointment Type</label>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <input
                type="radio"
                checked
                readOnly
                className="accent-green-600"
              />
              <span className="ml-2 font-medium">Medical Appointment</span>
            </div>
            <span className="text-xs text-gray-500">
              In-person examination and treatment
            </span>
          </div>
        </div>
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Preferred Date *</label>
            <Input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Preferred Time *</label>
            <Input
              name="time"
              type="time"
              value={form.time}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="mb-6">
          <label className="block font-medium mb-1">Reason for Visit *</label>
          <textarea
            name="reason"
            value={form.reason}
            onChange={handleChange}
            required
            rows={3}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="Describe your symptoms, concerns, or reason for this appointment..."
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Appointment Request"}
        </Button>
        {success && (
          <div className="mt-4 text-green-700 text-center font-medium">
            Appointment request submitted!
          </div>
        )}
      </form> */}

      {/* Side Info Panels */}
      <div className="flex flex-col gap-6 w-full lg:w-80">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-2 text-green-700 font-semibold">
            <Calendar className="h-5 w-5" />
            Office Hours
          </div>
          <div className="text-sm">
            <div>
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
              Your appointment request is submitted
            </li>
            <li>
              <span className="font-medium text-green-700">Confirmation:</span>{" "}
              We'll contact you within 24 hours to confirm
            </li>
            <li>
              <span className="font-medium text-green-700">Appointment:</span>{" "}
              Attend your scheduled appointment
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
              <span className="font-medium">General Inquiries:</span> (+234) 705
              171 9724
            </div>
            <div>
              <span className="font-medium">Email:</span>{" "}
              gabbyjunior4000@gmail.com
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
