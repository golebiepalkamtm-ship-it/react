import { useEffect } from "react";

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
}

export function useSEO({
  title,
  description,
  image,
  type = "website",
}: SEOProps) {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) {
      document.title = title.includes("Pałka MTM")
        ? title
        : `${title} | Pałka MTM`;
    }

    const updateMeta = (
      attr: "name" | "property",
      key: string,
      content?: string,
    ) => {
      if (!content) return;
      let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    if (description) {
      updateMeta("name", "description", description);
      updateMeta("property", "og:description", description);
      updateMeta("name", "twitter:description", description);
    }

    if (title) {
      updateMeta("property", "og:title", title);
      updateMeta("name", "twitter:title", title);
    }

    if (image) {
      const fullImageUrl = image.startsWith("http")
        ? image
        : `${window.location.origin}${image.startsWith("/") ? "" : "/"}${image}`;
      updateMeta("property", "og:image", fullImageUrl);
      updateMeta("name", "twitter:image", fullImageUrl);
    }

    if (type) {
      updateMeta("property", "og:type", type);
    }

    return () => {
      document.title = prevTitle;
    };
  }, [title, description, image, type]);
}
