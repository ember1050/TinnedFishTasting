import type { NextConfig } from "next";

const supabaseUrl = "https://vspsakcetjfegbpgalap.supabase.co";

const contentSecurityPolicy = [
  "default-src 'self'",
  `img-src 'self' ${supabaseUrl} data: blob:`,
  `connect-src 'self' ${supabaseUrl} wss://vspsakcetjfegbpgalap.supabase.co`,
  // Next.js injects inline bootstrap scripts/styles, and dev mode needs eval.
  // Keep CSP report-only until violations are clean; future hardening should move to nonces.
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "font-src 'self'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy-Report-Only",
            value: contentSecurityPolicy,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
