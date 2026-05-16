import { Metadata } from "next";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export function constructMetadata({
  title = "EZMAY By Gurleen | Handcrafted Artisan Indian Jewelry",
  description = "Handcrafted artisan Indian jewelry designed by Gurleen — a professional jewelry designer and professor with 15 years of experience, based in New Delhi.",
  image = "/og-image.jpg",
  url = "https://ezmay.in",
}: SEOProps = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
        },
      ],
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@ezmay_bygurleen",
    },
    metadataBase: new URL(url),
  };
}