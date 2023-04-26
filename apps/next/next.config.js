// /** @type {import('next').NextConfig} */
module.exports = {
  transpilePackages: ["@travel/shared", "@travel/ui", "@travel/api", "@travel/tailwind-config", "@travel/database"],
  experimental: {
    appDir: true,
  },
}
