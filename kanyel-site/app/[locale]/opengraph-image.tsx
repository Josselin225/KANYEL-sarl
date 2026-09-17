import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getSettings, pick, type Locale } from "@/lib/api";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const settings = await getSettings();
  const slogan = pick(settings, "slogan", locale as Locale) || "La lumière de l'Éternel";

  const logoPath = join(process.cwd(), "public", "brand", "kanyel-logo.jpg");
  const logoData = await readFile(logoPath);
  const logoBase64 = logoData.toString("base64");

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
          background: "#12173f",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "white",
            padding: "18px 32px",
            borderRadius: 24,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`data:image/jpeg;base64,${logoBase64}`} width={380} height={119} alt="" />
        </div>
        <div style={{ marginTop: 32, fontSize: 32, fontStyle: "italic", color: "#f2d581" }}>« {slogan} »</div>
      </div>
    ),
    { ...size }
  );
}
