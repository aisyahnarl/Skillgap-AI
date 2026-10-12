/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  // Izinkan upload file besar (video, PPT, dll) hingga 50MB
  experimental: {
    serverActions: {
      bodySizeLimit: '52mb',
    },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Backend FastAPI lokal
              "connect-src 'self' http://localhost:8000 http://127.0.0.1:8000 https://generativelanguage.googleapis.com https://api.openai.com",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
              "style-src 'self' 'unsafe-inline'",
              // Izinkan gambar dari Unsplash (digunakan di dashboard)
              "img-src 'self' data: https://images.unsplash.com blob:",
              // Izinkan media upload preview (video/audio blob)
              "media-src 'self' blob:",
            ].join('; '),
          },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
