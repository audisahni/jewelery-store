import { Metadata } from "next";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export function constructMetadata({
  title = "Jewelry Store | Fine Jewelry",
  description = "Discover our exquisite collection of fine jewelry. Handcrafted with passion and precision.",
  image = "/og-image.jpg",
  url = "https://jewelrystore.com",
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
      creator: "@jewelrystore",
    },
    metadataBase: new URL(url),
  };
}