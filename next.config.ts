import type { NextConfig } from "next";

/**
 * 환경변수 URL 값 끝의 슬래시를 제거해 rewrite destination을 안정적으로 만든다.
 * @param value 정리할 URL 문자열
 * @returns 끝 슬래시가 제거된 URL 문자열
 */
const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const apiBaseUrl = stripTrailingSlash(process.env.NEXT_PUBLIC_API_BASE_URL ?? "");

const nextConfig: NextConfig = {
  async rewrites() {
    if (!apiBaseUrl) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
