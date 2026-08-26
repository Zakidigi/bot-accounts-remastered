import { ImageResponse } from "next/og";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#b23a4e",
          borderRadius: 42,
        }}
      >
        <span style={{ fontSize: 112, lineHeight: 1 }}>🧁</span>
      </div>
    ),
    { width: 192, height: 192 }
  );
}
