import { sql } from "drizzle-orm"
import { mysqlTable, varchar, datetime, index, primaryKey, unique } from "drizzle-orm/mysql-core"

export const vanImages = mysqlTable(
  "VanImage",
  {
    id: varchar("id", { length: 191 }).notNull(),
    path: varchar("path", { length: 191 }).notNull(),
    vanId: varchar("vanId", { length: 191 }).notNull(),
    createdAt: datetime("createdAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: datetime("updatedAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    blurHash: varchar("blurHash", { length: 191 }),
  },
  (table) => {
    return {
      vanIdIdx: index("VanImage_vanId_idx").on(table.vanId),
      vanImageId: primaryKey(table.id),
      vanImageVanIdPathKey: unique("VanImage_vanId_path_key").on(table.vanId, table.path),
    }
  },
)
