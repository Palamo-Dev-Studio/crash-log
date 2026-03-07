// ABOUTME: Cover image component for issue pages with Sanity image URL builder.
// ABOUTME: Shows a placeholder when no image is provided, renders optimized image otherwise.

import Image from "next/image";
import { urlFor } from "@/lib/sanity";
import styles from "./CoverImage.module.css";

export default function CoverImage({ image, alt }) {
  if (!image) {
    return (
      <div className={styles.placeholder}>
        <span className={styles.placeholderText}>[ Cover Image ]</span>
      </div>
    );
  }

  const imageUrl = urlFor(image).width(1440).height(810).format("webp").url();

  return (
    <div className={styles.container}>
      <Image
        src={imageUrl}
        alt={alt || "Cover image for The Crash Log newsletter"}
        width={1440}
        height={810}
        className={styles.image}
        priority
      />
    </div>
  );
}
