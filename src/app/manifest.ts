import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Keyboard Adventure",
    short_name: "Adventure",
    description: "Fun typing practice for kids.",
    start_url: "/",
    display: "standalone",
    background_color: "#F4FBFF",
    theme_color: "#7657E8",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
