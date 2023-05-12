// /** @type {import('next').NextConfig} */
module.exports = {
  transpilePackages: ["@ramble/shared", "@ramble/ui", "@ramble/api", "@ramble/tailwind-config", "@ramble/database"],
  experimental: {
    appDir: true,
  },
}
