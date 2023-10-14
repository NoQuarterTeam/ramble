import { sql } from "drizzle-orm"
import { mysqlTable, varchar, datetime, index, primaryKey, unique } from "drizzle-orm/mysql-core"

export const spotImages = mysqlTable(
  "SpotImage",
  {
    id: varchar("id", { length: 191 }).notNull(),
    path: varchar("path", { length: 500 }).notNull(),
    spotId: varchar("spotId", { length: 191 }).notNull(),
    creatorId: varchar("creatorId", { length: 191 }).notNull(),
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
      creatorIdIdx: index("SpotImage_creatorId_idx").on(table.creatorId),
      spotIdIdx: index("SpotImage_spotId_idx").on(table.spotId),
      spotImageId: primaryKey(table.id),
      spotImageSpotIdPathKey: unique("SpotImage_spotId_path_key").on(table.spotId, table.path),
    }
  },
)
