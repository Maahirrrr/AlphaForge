/** @type {import("next").NextConfig} */
const isGithubActions = process.env.GITHUB_ACTIONS || false;
const basePath = isGithubActions || process.env.PAGES_BUILD ? "/AlphaForge" : "";

const nextConfig = {
  output: "export",
  basePath: basePath,
  assetPrefix: basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
