import { sql } from "drizzle-orm"
import { mysqlTable, varchar, datetime, longtext, tinyint, index, primaryKey } from "drizzle-orm/mysql-core"

export const lists = mysqlTable(
  "List",
  {
    id: varchar("id", { length: 191 }).notNull(),
    name: varchar("name", { length: 191 }).notNull(),
    creatorId: varchar("creatorId", { length: 191 }).notNull(),
    createdAt: datetime("createdAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: datetime("updatedAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3)`)
      .notNull(),
    description: longtext("description"),
    isPrivate: tinyint("isPrivate").default(0).notNull(),
  },
  (table) => {
    return {
      creatorIdIdx: index("List_creatorId_idx").on(table.creatorId),
      listId: primaryKey(table.id),
    }
  },
)
