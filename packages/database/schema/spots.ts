import { relations, sql } from "drizzle-orm"
import {
  mysqlTable,
  varchar,
  mysqlEnum,
  longtext,
  double,
  datetime,
  int,
  index,
  primaryKey,
  unique,
  boolean,
} from "drizzle-orm/mysql-core"
import { users } from "./users"

export const spotType = mysqlEnum("type", [
  "CAMPING",
  "FREE_CAMPING",
  "PARKING",
  "CLIMBING",
  "SURFING",
  "MOUNTAIN_BIKING",
  "HIKING_TRAIL",
  "PADDLE_KAYAK",
  "GAS_STATION",
  "ELECTRIC_CHARGE_POINT",
  "MECHANIC_PARTS",
  "VET",
  "CAFE",
  "RESTAURANT",
  "BAR",
  "SHOP",
  "VOLUNTEERING",
  "ART_FILM_PHOTOGRAPHY",
  "NATURE_EDUCATION",
  "FESTIVAL",
]).notNull()

export const spots = mysqlTable(
  "Spot",
  {
    id: varchar("id", { length: 191 }).notNull(),
    name: varchar("name", { length: 191 }).notNull(),
    type: spotType,
    description: longtext("description"),
    address: varchar("address", { length: 191 }),
    latitude: double("latitude").notNull(),
    longitude: double("longitude").notNull(),
    isPetFriendly: boolean("isPetFriendly").default(true).notNull(),
    verifiedAt: datetime("verifiedAt", { mode: "string", fsp: 3 }),
    verifierId: varchar("verifierId", { length: 191 }).references(() => users.id),
    creatorId: varchar("creatorId", { length: 191 })
      .notNull()
      .references(() => users.id),
    ownerId: varchar("ownerId", { length: 191 }).references(() => users.id),
    createdAt: datetime("createdAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: datetime("updatedAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3)`)
      .notNull(),
    campspaceId: int("campspaceId"),
    nesteId: varchar("nesteId", { length: 191 }),
    deletedAt: datetime("deletedAt", { mode: "string", fsp: 3 }),
    park4NightId: int("park4nightId"),
    cucortuId: varchar("cucortuId", { length: 191 }),
    komootId: varchar("komootId", { length: 191 }),
    loodusegakoosId: varchar("loodusegakoosId", { length: 191 }),
    natuurKampeerterreinenId: varchar("natuurKampeerterreinenId", { length: 191 }),
    publishedAt: datetime("publishedAt", { mode: "string", fsp: 3 }),
    roadsurferId: varchar("roadsurferId", { length: 191 }),
    sourceUrl: varchar("sourceUrl", { length: 500 }),
    surflineId: varchar("surflineId", { length: 191 }),
    theCragId: varchar("theCragId", { length: 191 }),
  },
  (table) => {
    return {
      campspaceIdIdx: index("Spot_campspaceId_idx").on(table.campspaceId),
      createdAtIdx: index("Spot_createdAt_idx").on(table.createdAt),
      creatorIdIdx: index("Spot_creatorId_idx").on(table.creatorId),
      cucortuIdIdx: index("Spot_cucortuId_idx").on(table.cucortuId),
      komootIdIdx: index("Spot_komootId_idx").on(table.komootId),
      latitudeIdx: index("Spot_latitude_idx").on(table.latitude),
      longitudeIdx: index("Spot_longitude_idx").on(table.longitude),
      loodusegakoosIdIdx: index("Spot_loodusegakoosId_idx").on(table.loodusegakoosId),
      ownerIdIdx: index("Spot_ownerId_idx").on(table.ownerId),
      park4NightIdIdx: index("Spot_park4nightId_idx").on(table.park4NightId),
      roadsurferIdIdx: index("Spot_roadsurferId_idx").on(table.roadsurferId),
      surflineIdIdx: index("Spot_surflineId_idx").on(table.surflineId),
      typeIdx: index("Spot_type_idx").on(table.type),
      typeLongitudeIdx: index("Spot_type_longitude_idx").on(table.type, table.longitude),
      verifierIdIdx: index("Spot_verifierId_idx").on(table.verifierId),
      spotId: primaryKey(table.id),
      spotCampspaceIdKey: unique("Spot_campspaceId_key").on(table.campspaceId),
      spotCucortuIdKey: unique("Spot_cucortuId_key").on(table.cucortuId),
      spotKomootIdKey: unique("Spot_komootId_key").on(table.komootId),
      spotLoodusegakoosIdKey: unique("Spot_loodusegakoosId_key").on(table.loodusegakoosId),
      spotNatuurKampeerterreinenIdKey: unique("Spot_natuurKampeerterreinenId_key").on(table.natuurKampeerterreinenId),
      spotNesteIdKey: unique("Spot_nesteId_key").on(table.nesteId),
      spotPark4NightIdKey: unique("Spot_park4nightId_key").on(table.park4NightId),
      spotRoadsurferIdKey: unique("Spot_roadsurferId_key").on(table.roadsurferId),
      spotSurflineIdKey: unique("Spot_surflineId_key").on(table.surflineId),
      spotTheCragIdKey: unique("Spot_theCragId_key").on(table.theCragId),
    }
  },
)

export const spotsRelations = relations(spots, ({ one }) => ({
  verifier: one(users, {
    fields: [spots.verifierId],
    references: [users.id],
  }),
  creator: one(users, {
    fields: [spots.creatorId],
    references: [users.id],
  }),
  owner: one(users, {
    fields: [spots.ownerId],
    references: [users.id],
  }),
}))
