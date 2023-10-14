import { sql } from "drizzle-orm"
import { mysqlTable, varchar, datetime, index, primaryKey } from "drizzle-orm/mysql-core"

export const listSpots = mysqlTable(
  "ListSpot",
  {
    id: varchar("id", { length: 191 }).notNull(),
    listId: varchar("listId", { length: 191 }).notNull(),
    spotId: varchar("spotId", { length: 191 }).notNull(),
    createdAt: datetime("createdAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: datetime("updatedAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
  },
  (table) => {
    return {
      listIdIdx: index("ListSpot_listId_idx").on(table.listId),
      spotIdIdx: index("ListSpot_spotId_idx").on(table.spotId),
      listSpotId: primaryKey(table.id),
    }
  },
)
