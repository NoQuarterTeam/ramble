import { drizzle } from "drizzle-orm/planetscale-serverless"
import { connect } from "@planetscale/database"
import * as schema from "./schema"
import { z } from "zod"

// Only use on the server
const envSchema = z.object({ DATABASE_URL: z.string() })

export const { DATABASE_URL } = envSchema.parse(process.env)

// create the connection
const connection = connect({ url: DATABASE_URL })

export const db = drizzle(connection, { schema })

async function main() {
  const users = await db.query.users.findMany({ columns: { id: true, email: true }, with: { createdSpots: { limit: 10 } } })
  db.insert(schema.users)

  console.log(users)
}

main().catch((e) => {
  console.log(e)
})
