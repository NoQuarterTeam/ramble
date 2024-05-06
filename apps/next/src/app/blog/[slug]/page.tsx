import { notion } from "@/lib/server/notion"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import dayjs from "dayjs"
import advancedFormat from "dayjs/plugin/advancedFormat"
import type { Metadata } from "next"
import { BLOG_NOTION_DB_ID } from "../config"
import { BlogDetail } from "./BlogDetail"
import { getBlogContent } from "./getBlogData"
dayjs.extend(advancedFormat)

export async function generateStaticParams() {
  const pages = await notion.databases.query({
    database_id: BLOG_NOTION_DB_ID,
    filter: {
      and: [
        { property: "Published", date: { is_not_empty: true, before: dayjs().format() } },
        { property: "Slug", rich_text: { is_not_empty: true } },
      ],
    },
  })

  return (pages.results as PageObjectResponse[])
    .map((page) => ({
      slug:
        page.properties.Slug.type === "rich_text" && !page.properties.Slug.rich_text[0]?.plain_text.startsWith("http")
          ? page.properties.Slug.rich_text[0]?.plain_text
          : undefined,
    }))
    .filter(Boolean)
}

export const generateMetadata = async ({ params: { slug } }: { params: { slug: string } }): Promise<Metadata> => {
  const { title, summary, cover } = await getBlogContent(slug)
  return {
    title,
    description: summary,
    openGraph: {
      title,
      description: summary || undefined,
      images: cover ? [cover] : undefined,
    },
  }
  // keywords
}

export default async function Page({ params }: { params: { slug: string } }) {
  const page = await getBlogContent(params.slug)
  return <BlogDetail page={page} />
}
