"use client";

import Image from "next/image";

type ClientImageProps = React.ComponentProps<typeof Image>;

export default function ClientImage({ onError, ...props }: ClientImageProps) {
  return (
    <Image
      {...props}
      onError={(e) => {
        e.currentTarget.src = "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04";
        onError?.(e);
      }}
    />
  );
}
