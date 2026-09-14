export function siteUrl(): string {
  const fallback = "https://keyboard-adventure.app";
  const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? fallback).trim().replace(/\/$/, "");
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return fallback;
    if (url.username || url.password) return fallback;
    const path = url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "");
    return `${url.origin}${path}`;
  } catch {
    return fallback;
  }
}

export const SITE_TITLE = "Keyboard Adventure – Fun Typing Practice for Kids";

export const SITE_DESCRIPTION =
  "A playful typing adventure for children to learn letters, keyboard skills, finger placement, and typing through fun lessons, visual guidance, rewards, and celebrations.";

export function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Keyboard Adventure",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    description: SITE_DESCRIPTION,
    url: siteUrl(),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}
