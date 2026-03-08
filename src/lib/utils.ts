import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitizes a URL to prevent XSS.
 * Allows only specific protocols and trusted domains/paths.
 */
export function sanitizeUrl(url: string | undefined): string {
  if (!url) return "";
  
  try {
    // If it's a relative path starting with /, it's trusted
    if (url.startsWith("/")) return url;
    
    const parsed = new URL(url);
    const allowedProtocols = ["http:", "https:"];
    
    if (!allowedProtocols.includes(parsed.protocol)) {
      return "";
    }

    // List of trusted domains for the application
    const trustedDomains = [
      "localhost",
      "champion-pigeon-auctions.com",
      "palkamt-storage.s3.eu-central-1.amazonaws.com",
      "images.unsplash.com",
      "res.cloudinary.com"
    ];

    const isTrustedDomain = trustedDomains.some(domain => 
      parsed.hostname === domain || parsed.hostname.endsWith("." + domain)
    );

    if (!isTrustedDomain) {
      // Never allow javascript: or other unsafe protocols
      if (parsed.protocol === "javascript:") return "";
      return ""; // Unknown/untrusted domains are rejected to prevent XSS
    }

    return url;
  } catch {
    // If it's not a valid absolute URL, allow safe relative paths and small data images only
    if (url.startsWith("/") || url.startsWith("./") || url.startsWith("../")) {
      return url;
    }
    if (url.startsWith("data:image/")) {
      // Allow data URLs for images but keep conservative: reject very large inline images
      if (url.length <= 40960) return url; // <=40KB
    }
    return "";
  }
}
