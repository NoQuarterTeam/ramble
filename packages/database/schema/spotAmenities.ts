import { sql } from "drizzle-orm"
import { mysqlTable, varchar, tinyint, datetime, primaryKey, unique } from "drizzle-orm/mysql-core"

export const spotAmenities = mysqlTable(
  "SpotAmenities",
  {
    id: varchar("id", { length: 191 }).notNull(),
    hotWater: tinyint("hotWater").default(0).notNull(),
    wifi: tinyint("wifi").default(0).notNull(),
    shower: tinyint("shower").default(0).notNull(),
    toilet: tinyint("toilet").default(0).notNull(),
    kitchen: tinyint("kitchen").default(0).notNull(),
    electricity: tinyint("electricity").default(0).notNull(),
    water: tinyint("water").default(0).notNull(),
    firePit: tinyint("firePit").default(0).notNull(),
    sauna: tinyint("sauna").default(0).notNull(),
    pool: tinyint("pool").default(0).notNull(),
    bbq: tinyint("bbq").default(0).notNull(),
    spotId: varchar("spotId", { length: 191 }).notNull(),
    createdAt: datetime("createdAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: datetime("updatedAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3)`)
      .notNull(),
  },
  (table) => {
    return {
      spotAmenitiesId: primaryKey(table.id),
      spotAmenitiesSpotIdKey: unique("SpotAmenities_spotId_key").on(table.spotId),
    }
  },
)
