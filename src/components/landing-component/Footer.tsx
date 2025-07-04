import Link from "next/link";
import Image from "next/image";
import youtube from "../../../public/assets/youtube.svg";
import x from "../../../public/assets/x.png";
import fb from "../../../public/assets/fb.png";
import insta from "../../../public/assets/insta.webp";

export const Footer = () => {
  return (
    <footer className="bg-[#1d884a] text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="flex flex-col items-center justify-center">
          <div className="flex text-shadow-lg py-8">
            <Link href="/">
              <span className="text-xl md:text-2xl font-bold">prime</span>
              <span className="text-2xl md:text-3xl font-extrabold">Care</span>
            </Link>
          </div>
          <p className="leading-4 text-[13px] pb-8">
            Baba Telehealth is a trademark of Baba Healthcare Digital Services
            inc.
          </p>
          <div className="flex gap-4 leading-4 text-[13px] pb-6">
            <span>Terms of Use</span>
            <span>Privacy Policy</span>
            <span>About us</span>
          </div>
        </div>

        <div className="border-t-1 flex flex-col sm:flex-row sm:justify-between sm:py-4 space-y-2">
          <p className="text-[14px] font-normal leading-6 pt-4">© 2025 BabaTelehealth. All rights reserved</p>
          <div className="flex gap-4 items-center">
            <Link href="">
              <Image src={fb} alt="facebook" width={20} height={20} />
            </Link>
            <Link href="">
              {" "}
              <Image src={insta} alt="insta" width={20} height={20} />
            </Link>
            <Link href="">
              {" "}
              <Image src={x} alt="x" width={20} height={20} />
            </Link>
            <Link href="">
              {" "}
              <Image src={youtube} alt="youtube" width={20} height={20} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
