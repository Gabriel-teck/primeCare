// types.ts
export type CarouselItem = {
  title: string;
  imageUrl: string;
  desc: string;
};

export const carouselItems: CarouselItem[] = [
  {
    title: "Dermatologist",
    imageUrl: "/assets/derma.svg",
    desc: "Book for your skin, hair and nails treatment.",
  },
  {
    title: "24/7 Pharmacy",
    imageUrl: "/assets/firstaid.svg",
    desc: "Get your prescriptions filled anytime, anywhere.",
  },
  {
    title: "Chronic Disease",
    imageUrl: "/assets/chronic.svg",
    desc: "Book for your full body screening to check for abnomalities",
  },
  {
    title: "Psychiatry ",
    imageUrl: "/assets/psycccc.svg",
    desc: "Access your complete medical history anytime.",
  },
  {
    title: "Midwives/Nurses",
    imageUrl: "/assets/nurse.jpg",
    desc: "Join personalized programs for better health.",
  },
  {
    title: "Dentist",
    imageUrl: "/assets/tooth.png",
    desc: "Book an appointment for your teeth treatment and care.",
  },
  {
    title: "Home Care",
    imageUrl: "/assets/home.svg",
    desc: "Book for home treatment service.",
  },
  {
    title: "Optician",
    imageUrl: "/assets/eyejpeg.jpeg",
    desc: "Book for an eye appointment to check for abnorlities",
  },
  {
    title: "Primary ",
    imageUrl: "/assets/ambulance.svg",
    desc: "We provide primary care services.",
  },
  {
    title: "Gynaecology ",
    imageUrl: "/assets/_gyna.svg",
    desc: "Book appointment for women's health, Pregnancy and Diagnosis.",
  },
];

export const steps = [
  {
    id: 1,
    title: "Browse Doctors/ Medical conditions",
    description:
      "Download and install the app from play store or app store. The app will guide you through the configuration process. Live support is available to help you.",
    btnImage: "/assets/btnImage1.webp",
  },
  {
    id: 2,
    title: "Consultation Type",
    description:
      "Connect your device anywhere in your home and turn it on. Follow the app's configuration instructions. Make sure your home WiFi is working well. Consult with our telehealth urgent care or medical specialties by text, phone call or video call.",
    btnImage: "/assets/btnImage2.avif",
  },
  {
    id: 3,
    title: "Make payment & confirm appointment",
    description:
      "Select your medical condition and make payment. Then you will be able to access our urgent care telehealth consultation from anywhere remotely or make an appointment with our medical specialist at your convenient time.",
    btnImage: "/assets/btnImage3.jpg",
  },
];
