import { ImageResponse } from "next/og";

export const alt = "Keyboard Adventure – Fun typing practice for kids";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#F4FBFF",
          color: "#34364A",
          fontSize: 56,
        }}
      >
        <div style={{ fontSize: 72 }}>🐻</div>
        <div style={{ color: "#7657E8", fontWeight: 700, marginTop: 16 }}>Keyboard Adventure</div>
        <div style={{ fontSize: 32, marginTop: 12 }}>Fun typing practice for kids</div>
        <div style={{ fontSize: 120, marginTop: 24, color: "#7657E8" }}>F</div>
      </div>
    ),
    { ...size },
  );
}
