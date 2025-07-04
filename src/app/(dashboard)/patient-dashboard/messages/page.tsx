import Link from "next/link";
import Image from "next/image";
import chat from "../../../../../public/assets/chat.webp";
import { Button } from "@/components/ui/button";

export default function MessagesPage() {
  return (
    <>
      <section className="relative pt-10 lg:pt-32 bg-white h-screen">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4 sm:px-6 lg:px-8">
          {/* Chat Text */}
          <div className="w-full md:w-1/2 space-y-6">
            <div className="text-[34px] font-semibold text-[#1d884a] text-left tracking-tight leading-9">
              <h2>24/7 Chats</h2>
            </div>
            <div className="pt-4 pb-2 md:pt-14 md:pb-0">
              <p className="text-base text-[#1d884a] font-medium tracking-normal md:text-2xl">
                Baba Telehealth offers 24/7 online diagnosis and treatment via
                your mobile device.
              </p>
            </div>

            <div className="leading-6 tracking-normal text-[16px] text-black">
              <p>
                <span className="font-bold">Prime</span>
                <span className="font-bold text-green-700">Care</span> Chat 24/7
                Services! Don't wait—start chatting with Baba Telehealth Doctors
                and healthcare professionals 24/7 and take the first step
                towards a healthier and happier you.
              </p>
            </div>
            <div>
              <Button
                variant="default"
                size="xl"
                className="bg-green-700 hover:bg-green-600"
              >
                Pay to Continue
              </Button>
            </div>
          </div>

          {/* Chat Image */}
          <div className="w-full md:w-1/2 max-w-[600px]">
            <Image
              src={chat}
              alt="chat 24/7"
              width={533}
              height={533}
              layout="responsive"
              priority
            />
          </div>
        </div>
      </section>
    </>
  );
}
