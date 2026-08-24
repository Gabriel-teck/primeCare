import Image, { StaticImageData } from "next/image";
import ranks from "../../../public/assets/ranks.svg";

type Testimonial = {
  name: string;
  image: string | StaticImageData;
  rating?: number;
  message: string;
};

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
  return (
    <div className="mx-auto w-full max-w-2xl rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-100">
          <Image
            src={testimonial.image}
            alt={testimonial.name}
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="truncate font-semibold text-gray-900">
            {testimonial.name}
          </h3>
          <Image
            src={ranks}
            alt="star rating"
            width={100}
            height={20}
            className="h-5 w-auto object-contain object-left"
          />
        </div>
      </div>

      <p className="min-h-[96px] text-[14px] leading-6 text-gray-600">
        {testimonial.message}
      </p>
    </div>
  );
};

export default TestimonialCard;
