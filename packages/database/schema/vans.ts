import { sql } from "drizzle-orm"
import { mysqlTable, varchar, int, longtext, datetime, index, primaryKey, unique } from "drizzle-orm/mysql-core"

export const vans = mysqlTable(
  "Van",
  {
    id: varchar("id", { length: 191 }).notNull(),
    name: varchar("name", { length: 191 }).notNull(),
    model: varchar("model", { length: 191 }).notNull(),
    year: int("year").notNull(),
    description: longtext("description"),
    userId: varchar("userId", { length: 191 }).notNull(),
    createdAt: datetime("createdAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: datetime("updatedAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3)`)
      .notNull(),
  },
  (table) => {
    return {
      userIdIdx: index("Van_userId_idx").on(table.userId),
      vanId: primaryKey(table.id),
      vanUserIdKey: unique("Van_userId_key").on(table.userId),
    }
  },
)
