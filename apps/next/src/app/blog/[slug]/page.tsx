import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import advancedFormat from "dayjs/plugin/advancedFormat"

import { AppCta } from "@/components/AppCta"
import { LinkButton } from "@/components/LinkButton"
import { BLOG_DB_ID, notion } from "@/lib/notion"
import dayjs from "dayjs"
import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import { NotionBlock } from "../components/NotionBlock"
import { Tag } from "../components/Tag"
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
    <div className="p-2 md:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <LinkButton size="sm" leftIcon={<ArrowLeft size={14} />} aria-label="Back to home" variant="outline" href="/blog">
          Back
        </LinkButton>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex flex-wrap gap-2">
            {page.tags.map((tag) => (
              <Tag key={tag.id} tag={tag} />
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
            height={350}
            className="w-full h-[350px] object-cover rounded-sm"
          />
        )}
        <div>
          {page.content.map((block) => (
            <NotionBlock key={block.id} block={block} />
          ))}
        </div>
        <div className="py-20">
          <AppCta message="Download the app now and explore!" />
        </div>
      </div>
    </div>
  )
}
