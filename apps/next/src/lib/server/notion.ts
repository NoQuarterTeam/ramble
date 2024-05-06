import { Client } from "@notionhq/client"
import { env } from "@ramble/server-env"

export const notion = new Client({ auth: env.NOTION_TOKEN })
