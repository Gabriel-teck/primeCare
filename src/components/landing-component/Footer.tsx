import { quickLinks, SocialMedia, legals, email } from "@/data/footer-data";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="flex flex-col font-bold items-center justify-center w-full gap-4 px-8 pt-12 pb-11 xl:px-0 bg-[#95efbaf8] ">
      <section className="w-full  lg:px-12 flex lg:flex-row flex-col justify-between items-start sm:gap-20 gap-10 pb-11 border-b border-b-light-grey-01">
        <div className="flex flex-col justify-start items-start gap-2 md:w-[247px] w-full lg:mx-0 mx-auto">
          <div className="flex text-shadow-lg">
            <Link href="/">
              <span className="text-xl md:text-2xl font-bold">prime</span>
              <span className="text-2xl md:text-3xl font-extrabold text-green-700">
                Care
              </span>
            </Link>
          </div>
          <p className="text-bold text-sm leading-tight text-lightGrey-05 sm:text-base">
            Your trusted health companion, connecting you to smarter care and
            the right medical support, efficiently and seamlessly.
          </p>
        </div>
        <section className="grid grid-cols-2 mx-auto md:grid-cols-4 sm:gap-20 gap-14 lg:mx-0">
          <div className="flex flex-col justify-start items-start gap-2.5">
            <p className="text-base font-medium leading-tight text-black">
              Quick links
            </p>
            <div className="flex flex-col items-start justify-start gap-2">
              {quickLinks.map((item, index) => (
                <Link
                  href={item.link}
                  key={index}
                  className="text-xs leading-tight text-lightGrey-05"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-start items-start gap-2.5">
            <p className="text-base font-medium leading-tight text-black">
              Social media
            </p>
            <div className="flex flex-col items-start justify-start gap-2">
              {SocialMedia.map((item, index) => (
                <Link
                  href={item.link}
                  key={index}
                  className="text-xs leading-tight text-lightGrey-05"
                  target="_blank"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-start items-start gap-2.5">
            <p className="text-base font-medium leading-tight text-black">
              Legals
            </p>
            <div className="flex flex-col items-start justify-start gap-2">
              {legals.map((item, index) => (
                <Link
                  href={item.link}
                  key={index}
                  className="text-xs leading-tight text-lightGrey-05"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-start items-start gap-2.5 overflow-hidden">
            <p className="text-base font-medium leading-tight text-black">
              Email
            </p>
            <div className="flex flex-col items-start justify-start gap-2 overflow-hidden">
              {email.map((item, index) => (
                <Link
                  href={item.link}
                  key={index}
                  className="text-xs leading-tight text-lightGrey-05 "
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </section>
      <div className="w-full px-5">
        <p className="text-xs font-normal text-center text-lightGrey-05">
          &copy; 2025 primeCare. All rights reserved. Developer by Gabriel Udoh.
        </p>
      </div>
    </footer>
  );
};
