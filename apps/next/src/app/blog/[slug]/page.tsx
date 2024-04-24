import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import advancedFormat from "dayjs/plugin/advancedFormat"

import { BLOG_DB_ID, notion } from "@/lib/notion"
import dayjs from "dayjs"
import type { Metadata } from "next"
import Image from "next/image"
import { NotionBlock } from "../components/NotionBlock"
import { getPageContent } from "./getPageContent"
dayjs.extend(advancedFormat)

export async function generateStaticParams() {
  const pages = await notion.databases.query({
    database_id: BLOG_DB_ID,
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
  const { title, summary, cover } = await getPageContent(slug)

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
  const slug = params.slug
  const page = await getPageContent(slug)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex flex-wrap gap-2">
          {page.tags.map((tag) => (
            <span
              key={tag}
              className="text-sm bg-primary-100 text-primary-800 px-3 py-1 rounded-full dark:bg-primary-900 dark:text-primary-300"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="opacity-60">{dayjs(page.publishedAt).format("Do MMMM YYYY")}</p>
      </div>
      <h1 className="text-4xl font-bold">{page.title}</h1>
      {page.cover && (
        <Image
          src={page.cover}
          unoptimized={!page.cover.startsWith("https://cdn.ramble")}
          alt={page.title}
          width={800}
          height={300}
          objectFit="cover"
          className="w-full h-[300px] object-cover rounded-sm"
        />
      )}
      <div>
        {page.content.map((block) => (
          <NotionBlock key={block.id} block={block} />
        ))}
      </div>
    </div>
  )
}
