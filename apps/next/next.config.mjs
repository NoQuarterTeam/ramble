/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  transpilePackages: [
    "axios",
    "decode-uri-component",
    "filter-obj",
    "loops",
    "kdbush",
    "loops",
    "query-string",
    "split-on-first",
    "supercluster",
    "superjson",
  ],
  images: {
    remotePatterns: [
      { hostname: "cdn.ramble.guide" },
      { hostname: "campspace.com" },
      { hostname: "hipcamp-res.cloudinary.com" },
      { hostname: "polskicaravaning.pl" },
      { hostname: "spots.roadsurfer.com" },
      { hostname: "www.norcamp.de" },
      { hostname: "cucortu.ro" },
      { hostname: "image.thecrag.com" },
      { hostname: "cdn3.park4night.com" },
      { hostname: "d2exd72xrrp1s7.cloudfront.net" },
      { hostname: "lh3.googleusercontent.com" },
    ],
  },
}

export default nextConfig
