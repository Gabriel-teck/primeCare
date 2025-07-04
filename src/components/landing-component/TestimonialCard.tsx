import Image from "next/image";
import ranks from "../../../public/assets/ranks.svg";

const TestimonialCard = ({ testimonial }: { testimonial: any }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <Image
          src={testimonial.image}
          alt={testimonial.name}
          width={40}
          height={40}
          className="rounded-full object-contain"
        />
        <div className="flex flex-col gap-1 mb-4">
          <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
          <Image src={ranks} alt="star" width={100} height={100} />
        </div>
      </div>

      <p className="text-[14px] text-gray-600 text-lg leading-6">
        {testimonial.message}
      </p>
    </div>
  );
};

export default TestimonialCard;
