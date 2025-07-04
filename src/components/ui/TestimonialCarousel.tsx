// components/TestimonialsCarousel.tsx
"use client";
import { useState } from "react";
import TestimonialCard from "@/components/landing-component/TestimonialCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    name: "Eze Macaulay Olatunde",
    image: "/assets/ava1.jpg",
    rating: 5,
    message:
      "The best telemedicine service available. The doctor I selected was super responsive and took care of my needs immediately.",
  },
  {
    name: "Gabriel Udoh",
    image: "/assets/ava2.jpg",
    rating: 3,
    message:
      "The best telemedicine service available. The doctor I selected was super responsive and took care of my needs immediately.",
  },
  {
    name: "Joseph Utulu",
    image: "/assets/ava3.jpg",
    rating: 4,
    message:
      "The best telemedicine service available. The doctor I selected was super responsive and took care of my needs immediately.",
  },
  {
    name: "Amanda Eze",
    image: "/assets/ava4.jpg",
    rating: 5,
    message:
      "Signing up and seeing a doctor was pretty quick and easy. Would recommend it if you’re trying to avoid visiting a doctor in person.",
  },
];

const TestimonialsCarousel = () => {
  const [index, setIndex] = useState(0);

  const handlePrev = () => {
    setIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative flex flex-col items-start">
      <TestimonialCard testimonial={testimonials[index]} />

      <div className="flex gap-2 py-4">
        <button
          onClick={handlePrev}
          className="w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center shadow-md cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={handleNext}
          className="w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center shadow-md cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default TestimonialsCarousel;
