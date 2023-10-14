import { sql } from "drizzle-orm"
import { mysqlTable, varchar, mysqlEnum, longtext, datetime, index, primaryKey } from "drizzle-orm/mysql-core"

export const feedback = mysqlTable(
  "Feedback",
  {
    id: varchar("id", { length: 191 }).notNull(),
    type: mysqlEnum("type", ["ISSUE", "IDEA", "OTHER"]).notNull(),
    message: longtext("message").notNull(),
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
      userIdIdx: index("Feedback_userId_idx").on(table.userId),
      feedbackId: primaryKey(table.id),
    }
  },
)
