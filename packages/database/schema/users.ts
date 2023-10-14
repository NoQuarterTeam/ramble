import { relations, sql } from "drizzle-orm"
import {
  mysqlTable,
  varchar,
  mysqlEnum,
  tinyint,
  longtext,
  datetime,
  index,
  primaryKey,
  unique,
  boolean,
} from "drizzle-orm/mysql-core"
import { spots } from "./spots"

export const users = mysqlTable(
  "User",
  {
    id: varchar("id", { length: 191 }).notNull(),
    email: varchar("email", { length: 191 }).notNull(),
    password: varchar("password", { length: 191 }).notNull(),
    firstName: varchar("firstName", { length: 191 }).notNull(),
    lastName: varchar("lastName", { length: 191 }).notNull(),
    role: mysqlEnum("role", ["GUIDE", "OWNER", "MEMBER"]).default("MEMBER").notNull(),
    avatar: varchar("avatar", { length: 191 }),
    isPetOwner: boolean("isPetOwner").default(false).notNull(),
    isClimber: boolean("isClimber").default(false).notNull(),
    isHiker: boolean("isHiker").default(false).notNull(),
    isMountainBiker: boolean("isMountainBiker").default(false).notNull(),
    isPaddleBoarder: boolean("isPaddleBoarder").default(false).notNull(),
    bio: longtext("bio"),
    createdAt: datetime("createdAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: datetime("updatedAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    username: varchar("username", { length: 191 }).notNull(),
    isSurfer: boolean("isSurfer").default(false).notNull(),
    instagram: varchar("instagram", { length: 191 }),
    avatarBlurHash: varchar("avatarBlurHash", { length: 191 }),
    isVerified: boolean("isVerified").default(false).notNull(),
    isAdmin: boolean("isAdmin").default(false).notNull(),
    isPendingGuideApproval: boolean("isPendingGuideApproval").default(false).notNull(),
  },
  (table) => {
    return {
      usernameIdx: index("User_username_idx").on(table.username),
      userId: primaryKey(table.id),
      userEmailKey: unique("User_email_key").on(table.email),
      userUsernameKey: unique("User_username_key").on(table.username),
    }
  },
)

export const userFollows = mysqlTable(
  "_UserFollows",
  {
    folllower: varchar("A", { length: 191 }).notNull(),
    followee: varchar("B", { length: 191 }).notNull(),
  },
  (table) => {
    return {
      bIdx: index("userFollows").on(table.followee),
      userFollowsAbUnique: unique("_UserFollows_AB_unique").on(table.folllower, table.followee),
    }
  },
)

export const usersRelations = relations(users, ({ many }) => ({
  createdSpots: many(spots, { relationName: "createdSpots" }),
  // ownedSpots: many(spots, { relationName: "ownedSpots" }),
  // verifiedSpots: many(spots, { relationName: "verifiedSpots" }),
  userFollows: many(userFollows),
}))

export const userFollowsRelations = relations(userFollows, ({ one }) => ({
  follower: one(users, { fields: [userFollows.folllower], references: [users.id], relationName: "follower" }),
  followeww: one(users, { fields: [userFollows.followee], references: [users.id], relationName: "followee" }),
}))
