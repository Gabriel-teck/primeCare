import Image from "next/image";
import { ChevronRight, Cross, Search } from "lucide-react";
import first_medic from "../../../public/assets/medic2_img.svg";
import consult from "../../../public/assets/consult.svg";
import realmap from "../../../public/assets/real-map.png";
import firstaid from "../../../public/assets/firstaid.svg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Carousel from "@/components/custom/Carousel";
import Howitworks from "@/components/landing-component/Howitworks";
import TestimonialsCarousel from "@/components/ui/TestimonialCarousel";

export default function Home() {
  return (
    <>
      <main className="bg-white">
        {/* Hero section */}
        <section className="relative pt-20 lg:pt-32">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-start px-4 sm:px-6 lg:px-8">
            {/* Hero Text with desktop search bar inside */}
            <div className="order-1 md:order-1 w-full md:w-1/2 space-y-6">
              <div className="flex gap-1.5 pt-4 pb-2 md:pt-14 md:pb-0">
                <span className="text-red-300">
                  <Cross className="w-4 h-4" />
                </span>
                <p className="text-base text-[#1d884a] font-black tracking-normal md:text-2xl">
                  Best Healthcare
                </p>
              </div>

              <div className="text-[34px] font-semibold text-black text-left tracking-tight leading-9">
                <h2>
                  Online Doctors <br /> A Few Clicks Away!
                </h2>
              </div>

              <div className="leading-6 text-[18px] text-black">
                <p>
                  PrimeCare provides a One-stop Health Solution. A few clicks
                  away! Contact a doctor, other healthcare professionals, or a
                  specialist via text, video, or phone.
                </p>
              </div>

              {/* Desktop-only search bar */}
              <div className="relative hidden md:block pt-4">
                <form className="space-y-2">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Conditions, Procedures"
                      className="rounded-full w-full pl-10 pr-4 py-4 focus:outline-none"
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  </div>
                  <Button
                    variant="ghost"
                    size="xl"
                    className="rounded-full  bg-green-600 text-lg text-white hover:text-white hover:bg-green-700 flex items-center gap-2"
                  >
                    Search <ChevronRight className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </div>

            {/* Hero Image */}
            <div className="order-2 md:order-2 w-full md:w-1/2 max-w-[600px]">
              <Link href="">
                <Image
                  src={first_medic}
                  alt="Medic-1"
                  width={533}
                  height={533}
                  layout="responsive"
                  priority
                />
              </Link>
            </div>

            {/* Mobile-only search bar (comes last) */}
            <div className="order-3 md:hidden w-full pt-4">
              <form className="space-y-2">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Conditions, Procedures"
                    className="rounded-full h-12 w-full pl-10 pr-4 py-2 focus:border-none"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>
                <Button
                  variant="outline"
                  size="xl"
                  className="rounded-full px-12 text-md bg-green-700 text-white hover:text-white hover:text-lg hover:bg-green-700 flex items-center gap-4"
                >
                  Search <ChevronRight className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* Consultation section */}
        <section className="mt-[18px]">
          <div className="container mx-auto flex flex-col gap-6 md:flex-row px-4 sm:px-6 lg:px-8 md:items-start justify-center">
            <div className="order-2 md:order-1">
              <Image src={consult} alt="consult svg" />
            </div>
            <div className="order-1 ">
              <h2 className="text-[#212529] text-[30px] sm:text-[40px] font-semibold mt-[35px] leading-10">
                Online appointments
              </h2>
              <p className="leading-5 mt-[30px] text-sm font-light tracking-tight">
                Consultation with Doctors and other healthcare professionals
                <br></br>
                <span className="font-bold">Whenever! Wherever! Anywhere!</span>
              </p>
              <Button
                variant="outline"
                size="xl"
                className="mt-[26px] rounded-full px-12 text-md md:text-lg bg-green-700 text-white hover:text-white hover:text-lg hover:bg-green-700 flex items-center gap-4"
              >
                Book <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Urgent care */}
        <section className="w-full mt-[60px] px-[20px]">
          <div className="container mx-auto flex flex-col md:flex-row md:justify-between p-[30px] md:p-[35px] sm:px-6 lg:px-8 bg-[linear-gradient(135deg,_#1d884a,_#9fd6b6)] rounded-[20px]">
            <div className="max-w-xl flex flex-col items-center md:items-start text-white">
              <h3 className="tracking-normal text-[36px] font-bold mb-[30px]">
                Urgent Care
              </h3>
              <p className="text-[14px] tracking-tight leading-5 font-normal mb-[30px]">
                Same-day doctor's appointment for diagnosis and treatment of
                medical illnesses that are acute but do not pose an immediate
                threat to life and health
              </p>
            </div>
            <div className="max-w-4xl flex flex-col items-end">
              <span className="font-bold text-[#9ed2b3] text-[64px]">24/7</span>
              <Image
                src={firstaid}
                alt="firstaid box"
                width={106}
                height={106}
              />
            </div>
          </div>
        </section>

        {/* Need An Urgent Care Section */}
        <section className="w-[100%] mt-[10rem]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col mx-auto md:w-[80%] items-center">
              <h1 className="text-[rgb(51, 51, 51)] text-[32px] font-semibold tracking-normal">
                Need an urgent care?
              </h1>
              <p className="px-5 text-[14px] font-normal tracking-tight leading-6 text-[#828282]">
                See, Speak or Text a doctor now Online! Seven days a week.
                Receive advice or treatment for any of the listed medical
                conditions for only ₦3,000. Book and consult with a doctor from
                anywhere on any device or web browser.
              </p>
            </div>

            {/* List of bookings */}
            <div className="grid md:grid-cols-3 gap-2 md:gap-x-4 mt-8">
              {Array.from({ length: 12 }).map((_, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="xl"
                  className="bg-[#ffff] text-[16px] font-bold leading-5 text-left text-[rgb(29,136,74)] flex justify-between border-1 border-[rgb(29,136,74)] rounded-[50px] pt-[16px] pr-[20px] pb-[15px] pl-[25px]"
                >
                  Malaria
                  <span className="rounded-full bg-green-100 p-0.5">
                    <ChevronRight />
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Medical Specialists */}
        <section className="w-[100%] mt-[10rem]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col mx-auto md:w-[80%] items-center">
              <h1 className="text-[rgb(51, 51, 51)] text-[32px] font-semibold tracking-normal">
                Medical specialties
              </h1>
              <p className="px-5 text-[14px] font-normal tracking-tight leading-6 text-[#828282]">
                Baba Telehealth provides access to a wide range of specialists
                and doctors who have the right experience and expertise for your
                specific conditions. Best of all, you do not have to worry about
                travelling. Book an Online appointment for the days and times
                that work best for you.
              </p>
            </div>

            {/* List of bookings */}
            <div>
              <Carousel />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mt-[2rem] bg-[#F6FAFD]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col mx-auto md:w-[80%] items-center">
              <h1 className="pt-[90px] text-[rgb(51, 51, 51)] text-[32px] font-semibold tracking-normal">
                How It Works
              </h1>
              <p className="px-5 text-[14px] font-normal tracking-tight leading-6 text-[#828282]">
                Baba Telehealth provides access to a wide range of specialists
                and doctors with the right experience and expertise for your own
                unique concerns.
              </p>
            </div>

            {/* How it works image selector */}
            <div>
              <Howitworks />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mt-2rem bg-[#f9f8fa]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-18">
            <div className="flex flex-col items-center justify-center lg:flex-row gap-6 px-[20px] ">
              <div className="">
                <Image src={realmap} alt="Map image" width={492} height={394} />
              </div>
              <div className="">
                <p className="text-[#1d884a] text-[16px] font-bold mb-[15px]">
                  Testimonials
                </p>
                <h1 className="font-semibold text-[32px] text-[#333] mb-[15px]">
                  Our customers love using PrimeCare
                </h1>

                <p className="mb-[20px] text-[#828282] text-[14px] font-normal">
                  Check out what they’re saying about us!
                </p>

                {/* Testimonial carousel */}
                <div className="pt-8">
                  <TestimonialsCarousel />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
