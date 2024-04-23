import { Client } from "@notionhq/client"
import { env } from "@ramble/server-env"

export const notion = new Client({ auth: env.NOTION_TOKEN })

export const BLOG_DB_ID = "572e63f728e74cc985bc1ff9aa50727e"
