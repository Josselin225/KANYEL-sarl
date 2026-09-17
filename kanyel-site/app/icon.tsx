import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  const iconPath = join(process.cwd(), "public", "brand", "kanyel-k-icon.png");
  const data = await readFile(iconPath);
  const base64 = data.toString("base64");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:image/png;base64,${base64}`} width={56} height={56} alt="" />
      </div>
    ),
    { ...size }
  );
}
