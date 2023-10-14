import { drizzle } from "drizzle-orm/planetscale-serverless"
import { connect } from "@planetscale/database"
import * as schema from "./schema"
import { z } from "zod"
import { eq } from "drizzle-orm"

// Only use on the server
const envSchema = z.object({ DATABASE_URL: z.string() })

export const { DATABASE_URL } = envSchema.parse(process.env)

// create the connection
const connection = connect({ url: DATABASE_URL })

export const db = drizzle(connection, { schema })

async function main() {
  const found = await db.query.users.findFirst({
    columns: { id: true, email: true },
    where: eq(schema.users.email, "jack@noquarter.co"),
  })

  console.log(found)
}

main().catch((e) => {
  console.log(e)
})
