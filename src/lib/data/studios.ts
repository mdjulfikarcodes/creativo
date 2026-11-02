export type Studio = {
  id: string;
  categorySlug: string;
  category: string;
  title: string;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  location: string;
  price: number;
  capacity: number;
  saved: boolean;
  featured: boolean;
  amenities: string[];
};

export const studios: Studio[] = [
  {
    id: "daylight-infinity-cove",
    categorySlug: "photo",
    category: "Photo Studios",
    title: "The Daylight Infinity Cove & Cyclorama Loft",
    description:
      "A pristine 2,400 sq.ft daylight photo studio in Al Olaya featuring a continuous 30ft white infinity cyclorama wall, soaring 16ft ceilings, and Profoto strobe arrays.",
    image:
      "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=1600&auto=format&fit=crop",
    rating: 4.96,
    reviews: 48,
    location: "Al Olaya, Riyadh",
    price: 420,
    capacity: 25,
    saved: true,
    featured: true,
    amenities: [
      "30ft infinity cyclorama",
      "Profoto strobe arrays",
      "16ft ceilings",
      "Freight elevator access",
    ],
  },
  {
    id: "apex-cinema-sound-stage",
    categorySlug: "sound-stages",
    category: "Sound Stages",
    title: "Apex Cinema Production Sound Stage B",
    description:
      "Engineered for commercial shoots, TV series, and film production in Riyadh. Featuring acoustic STC-55 isolation, drive-in load access, and 400A Camlock power.",
    image:
      "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=1600&auto=format&fit=crop",
    rating: 4.98,
    reviews: 62,
    location: "Hittin, Riyadh",
    price: 680,
    capacity: 45,
    saved: true,
    featured: true,
    amenities: [
      "STC-55 acoustic isolation",
      "400A Camlock power",
      "Heavy-duty truss grid",
      "Drive-in load access",
    ],
  },
  {
    id: "resonance-podcast-suite",
    categorySlug: "podcast",
    category: "Podcast Rooms",
    title: "The Resonance Broadcast & Podcast Suite",
    description:
      "A turnkey broadcast-ready podcast suite in KAFD designed for premium video podcasts, executive interviews, and Arabic & English multi-cam streaming.",
    image:
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1600&auto=format&fit=crop",
    rating: 4.94,
    reviews: 39,
    location: "KAFD, Riyadh",
    price: 280,
    capacity: 8,
    saved: false,
    featured: true,
    amenities: [
      "4K multi-cam switching",
      "Shure SM7B array",
      "Acoustic walnut diffusers",
      "Remote guest monitoring",
    ],
  },
  {
    id: "halcyon-daylight-photo-loft",
    categorySlug: "photo",
    category: "Photo Studios",
    title: "The Halcyon Daylight Photo Loft",
    description:
      "A sun-drenched loft in North Riyadh with south-facing windows, seamless paper backdrops, and a dedicated styling rail for editorial and e-commerce fashion work.",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1600&auto=format&fit=crop",
    rating: 4.92,
    reviews: 31,
    location: "Al Malqa, Riyadh",
    price: 360,
    capacity: 18,
    saved: false,
    featured: false,
    amenities: [
      "South-facing daylight",
      "Seamless paper system",
      "Styling rail & steamer",
      "Blackout curtains",
    ],
  },
  {
    id: "studio-nine-analog-recording",
    categorySlug: "music",
    category: "Music Suites",
    title: "Studio Nine Analog Recording Room",
    description:
      "A premier tracking room in Al Nakheel with a restored analog console, isolated live vocal booth, and calibrated Dolby Atmos monitoring.",
    image:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1600&auto=format&fit=crop",
    rating: 4.97,
    reviews: 44,
    location: "Al Nakheel, Riyadh",
    price: 450,
    capacity: 12,
    saved: false,
    featured: false,
    amenities: [
      "Restored analog console",
      "Isolated live booth",
      "Vintage outboard rack",
      "Dolby Atmos monitoring",
    ],
  },
  {
    id: "kiln-canvas-maker-atelier",
    categorySlug: "art",
    category: "Art Workshops",
    title: "The Kiln & Canvas Maker Atelier",
    description:
      "A working maker atelier in the historic Jax Arts District with pottery wheels, a full-size ceramic kiln, and modular worktables for workshops and exhibitions.",
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1600&auto=format&fit=crop",
    rating: 4.89,
    reviews: 27,
    location: "Jax District, Diriyah, Riyadh",
    price: 250,
    capacity: 20,
    saved: false,
    featured: false,
    amenities: [
      "Six pottery wheels",
      "Full-size kiln access",
      "Modular worktables",
      "Ventilated finishing room",
    ],
  },
];

export const featuredStudios = studios.filter((studio) => studio.featured);

export function getStudioById(id: string) {
  return studios.find((studio) => studio.id === id);
}

export function getStudiosByCategory(slug?: string) {
  if (!slug) return studios;

  return studios.filter((studio) => studio.categorySlug === slug);
}

export function getSimilarStudios(studio: Studio, limit = 3) {
  const sameCategory = studios.filter(
    (candidate) =>
      candidate.id !== studio.id && candidate.categorySlug === studio.categorySlug
  );
  const others = studios.filter(
    (candidate) =>
      candidate.id !== studio.id && candidate.categorySlug !== studio.categorySlug
  );

  return [...sameCategory, ...others].slice(0, limit);
}
