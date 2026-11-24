/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Stop `next dev` rewriting its own block into AGENTS.md; the file says
  // "Next.js 16" itself.
  agentRules: false,
  turbopack: {
    // There is an unrelated package-lock.json in the home directory above this
    // project. Without pinning the root, Turbopack walks up and tries to treat
    // $HOME as the workspace root.
    root: import.meta.dirname,
  },
  // the hubs' old addresses, kept working for saved links
  async redirects() {
    return [
      { source: "/progress", destination: "/myskin", permanent: true },
      { source: "/progress/:path*", destination: "/myskin/:path*", permanent: true },
      { source: "/check", destination: "/analyses", permanent: true },
      { source: "/check/:path*", destination: "/analyses/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
