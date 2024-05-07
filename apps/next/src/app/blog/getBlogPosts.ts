import { notion } from "@/lib/server/notion"
import { upload } from "@/lib/server/s3"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import dayjs from "dayjs"
import { unstable_cache } from "next/cache"
import { BLOG_NOTION_DB_ID, BLOG_S3_FOLDER } from "./config"

export const getBlogPosts = unstable_cache(
  async () => {
    const content = await notion.databases.query({
      database_id: BLOG_NOTION_DB_ID,
      filter: {
        and: [
          { property: "Published", date: { is_not_empty: true, before: dayjs().format() } },
          { property: "Slug", rich_text: { is_not_empty: true } },
        ],
      },
      sorts: [{ property: "Published", direction: "descending" }],
    })

    return Promise.all(
      (content.results as PageObjectResponse[]).map(async (page) => {
        let cover: string | null = null
        if (page.cover) {
          const imageUrl = page.cover.type === "external" ? page.cover.external.url : page.cover.file.url
          cover = await upload(imageUrl, BLOG_S3_FOLDER)
        }
        const properties = page.properties
        return {
          id: page.id,
          title: properties.Title.type === "title" ? properties.Title.title[0].plain_text : "",
          summary: properties.Summary.type === "rich_text" ? properties.Summary.rich_text[0]?.plain_text : null,
          tags: properties.Tags.type === "multi_select" ? properties.Tags.multi_select : [],
          publishedAt: properties.Published.type === "date" ? properties.Published.date?.start! : "",
          cover,
          slug: properties.Slug.type === "rich_text" ? properties.Slug.rich_text[0]!.plain_text! : "",
        }
      }),
    )
  },
  ["blog"],
  { revalidate: 86400, tags: ["blog"] },
)
