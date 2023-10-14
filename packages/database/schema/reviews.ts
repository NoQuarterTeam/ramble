import { sql } from "drizzle-orm"
import { mysqlTable, varchar, int, longtext, datetime, index, primaryKey } from "drizzle-orm/mysql-core"

export const reviews = mysqlTable(
  "Review",
  {
    id: varchar("id", { length: 191 }).notNull(),
    spotId: varchar("spotId", { length: 191 }).notNull(),
    userId: varchar("userId", { length: 191 }).notNull(),
    rating: int("rating").notNull(),
    description: longtext("description").notNull(),
    createdAt: datetime("createdAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: datetime("updatedAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
  },
  (table) => {
    return {
      spotIdIdx: index("Review_spotId_idx").on(table.spotId),
      userIdIdx: index("Review_userId_idx").on(table.userId),
      reviewId: primaryKey(table.id),
    }
  },
)
