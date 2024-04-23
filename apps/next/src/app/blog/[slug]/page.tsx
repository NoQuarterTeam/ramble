import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"

import { BLOG_DB_ID, notion } from "@/lib/notion"
import { NotionBlock } from "../components/NotionBlock"
import { getPageContent } from "./getPageContent"

export async function generateStaticParams() {
  const pages = await notion.databases.query({
    database_id: BLOG_DB_ID,
    filter: {
      and: [
        { property: "Published", date: { is_not_empty: true } },
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

export const revalidate = 30

export const generateMetadata = async ({ params: { slug } }: { params: { slug: string } }) => {
  const { title, page } = await getPageContent(slug)
  const summary = page.properties.Summary.type === "rich_text" ? page.properties.Summary.rich_text[0]?.plain_text : null
  // const keywords = page.properties.Meta?.type === "rich_text" ? page.properties.Meta.rich_text[0]?.plain_text.split(" ") : null
  return {
    title,
    description: summary,
    // keywords
  }
}

export default async function Page({ params }: { params: { slug: string } }) {
  const slug = params.slug
  const { content, title } = await getPageContent(slug)

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">{title}</h1>
      <div>
        {content.map((block) => (
          <NotionBlock key={block.id} block={block} />
        ))}
      </div>
    </div>
  )
}
