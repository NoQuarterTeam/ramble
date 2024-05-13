import { notion } from "@/lib/server/notion"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import dayjs from "dayjs"
import { BLOG_NOTION_DB_ID } from "./blog/config"

export const getBlogPostsForSitemap = async () => {
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

  return (content.results as PageObjectResponse[]).map((page) => {
    const properties = page.properties
    return {
      title: properties.Title.type === "title" ? properties.Title.title[0].plain_text : "",
      publishedAt: properties.Published.type === "date" ? properties.Published.date?.start! : "",
      slug: properties.Slug.type === "rich_text" ? properties.Slug.rich_text[0]!.plain_text! : "",
    }
  })
}

export default async function sitemap() {
  const FULL_URL = "https://ramble.guide"
  const blogs = await getBlogPostsForSitemap()

  const items = blogs.map((item) => ({
    url: `${FULL_URL}/blog/${item.slug}`,
    lastModified: dayjs(item.publishedAt).format("YYYY-MM-DD"),
  }))

  const routes = ["", "/blog", "/about", "/spots", "/privacy"].map((route) => ({
    url: `${FULL_URL}${route}`,
    lastModified: dayjs().format("YYYY-MM-DD"),
  }))

  return [...routes, ...items]
}
