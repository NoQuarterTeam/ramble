import { sql } from "drizzle-orm"
import { mysqlTable, varchar, datetime, primaryKey } from "drizzle-orm/mysql-core"

export const accessRequests = mysqlTable(
  "AccessRequest",
  {
    id: varchar("id", { length: 191 }).notNull(),
    email: varchar("email", { length: 191 }).notNull(),
    createdAt: datetime("createdAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: datetime("updatedAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3)`)
      .notNull(),
  },
  (table) => {
    return {
      accessRequestId: primaryKey(table.id),
    }
  },
)
