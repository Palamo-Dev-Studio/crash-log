// ABOUTME: Portable Text component configuration for @portabletext/react.
// ABOUTME: Defines rendering for blocks, marks, and image types from Sanity content.

import Image from "next/image";
import { urlFor } from "@/lib/sanity";

export const portableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => <code>{children}</code>,
    link: ({ value, children }) => {
      const href = value?.href || "#";
      const isExternal = href.startsWith("http");
      return (
        <a
          href={href}
          {...(isExternal && {
            target: "_blank",
            rel: "noopener noreferrer",
          })}
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      const url = urlFor(value).width(1440).format("webp").url();
      return (
        <figure>
          <Image
            src={url}
            alt={value.alt || ""}
            width={720}
            height={405}
            style={{ width: "100%", height: "auto" }}
          />
        </figure>
      );
    },
  },
};
