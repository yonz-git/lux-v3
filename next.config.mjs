/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    // There is an unrelated package-lock.json in the home directory above this
    // project. Without pinning the root, Turbopack walks up and tries to treat
    // $HOME as the workspace root.
    root: import.meta.dirname,
  },
};

export default nextConfig;
