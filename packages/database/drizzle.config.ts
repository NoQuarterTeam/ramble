import type { Config } from "drizzle-kit"

export default {
  schema: "./schema/*",
  out: "./drizzle",
  driver: "mysql2",
  strict: true,
  dbCredentials: {
    connectionString: "mysql://root:@127.0.0.1:3306/ramble",
  },
} satisfies Config
