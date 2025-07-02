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
