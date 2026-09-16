/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Evita que `next dev` inserte su bloque gestionado en AGENTS.md y CLAUDE.md (son punteros a docs/base-standards.md).
  agentRules: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
    ],
  },
};

module.exports = nextConfig;
