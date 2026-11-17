import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const isDev = process.env.NODE_ENV !== "production";

// N'accepter que les images de l'hôte exact de notre backend, jamais un joker —
// sinon l'optimiseur d'images de Next.js pourrait être amené à récupérer
// des URL arbitraires au nom du serveur (SSRF).
const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000");

// Content-Security-Policy : limite les origines des scripts, images, frames et
// appels API, afin de bloquer un <script> injecté ou une requête d'exfiltration.
// 'unsafe-inline' pour les scripts est requis par le bootstrap inline de Next.js
// et les blocs JSON-LD ; 'unsafe-eval' et les websockets seulement en dev (HMR).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${apiUrl.origin}`,
  "font-src 'self' data:",
  `connect-src 'self' ${apiUrl.origin}${isDev ? " ws: wss:" : ""}`,
  "frame-src https://www.google.com https://maps.google.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const nextConfig: NextConfig = {
  images: {
    // Les IP locales (localhost) ne servent qu'en développement ; ne jamais
    // les autoriser dans un build de production.
    dangerouslyAllowLocalIP: isDev,
    remotePatterns: [
      {
        protocol: apiUrl.protocol.replace(":", "") as "http" | "https",
        hostname: apiUrl.hostname,
        port: apiUrl.port || undefined,
        pathname: "/media/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
