import {
  Camera,
  Clapperboard,
  Mic,
  Music2,
  Palette,
  type LucideIcon,
} from "lucide-react";

export type StudioCategory = {
  slug: string;
  title: string;
  count: string;
  description: string;
  icon: LucideIcon;
};

export const studioCategories: StudioCategory[] = [
  {
    slug: "photo",
    title: "Photo Studios",
    count: "32 Spaces",
    description: "Daylight lofts, cove walls, and cyc spaces",
    icon: Camera,
  },
  {
    slug: "sound-stages",
    title: "Sound Stages",
    count: "18 Stages",
    description: "STC-rated soundproof cinema stages",
    icon: Clapperboard,
  },
  {
    slug: "podcast",
    title: "Podcast Rooms",
    count: "24 Suites",
    description: "Multi-cam 4K turntable podcast rooms",
    icon: Mic,
  },
  {
    slug: "music",
    title: "Music Suites",
    count: "15 Studios",
    description: "Analog consoles & live tracking booths",
    icon: Music2,
  },
  {
    slug: "art",
    title: "Art Workshops",
    count: "12 Spaces",
    description: "Ceramic, sculpture & maker ateliers",
    icon: Palette,
  },
];

export function getCategoryHref(slug: string) {
  return `/studios?category=${encodeURIComponent(slug)}`;
}
