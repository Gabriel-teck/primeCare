"use client";

import { useEffect, useState } from "react";
import TestimonialCard from "@/components/landing-component/TestimonialCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AUTO_ADVANCE_MS = 4500;

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
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, AUTO_ADVANCE_MS);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrev = () => {
    setIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <div
      className="relative flex w-full flex-col items-start"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        key={testimonials[index].name}
        className="w-full animate-howitworks-fade"
      >
        <TestimonialCard testimonial={testimonials[index]} />
      </div>

      <div className="flex gap-2 py-4">
        <button
          onClick={handlePrev}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-green-700 text-white shadow-md"
          aria-label="Previous testimonial"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={handleNext}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-green-700 text-white shadow-md"
          aria-label="Next testimonial"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default TestimonialsCarousel;
