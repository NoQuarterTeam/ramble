/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ],
  },
}

export default nextConfig
