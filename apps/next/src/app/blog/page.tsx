import { BLOG_DB_ID, notion } from "@/lib/notion"
import { upload } from "@/lib/s3"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"

import dayjs from "dayjs"
import advancedFormat from "dayjs/plugin/advancedFormat"
import { unstable_cache } from "next/cache"
import Image from "next/image"
import Link from "next/link"
import { Tag } from "./components/Tag"
dayjs.extend(advancedFormat)

const getItems = unstable_cache(
  async () => {
    const content = await notion.databases.query({
      database_id: BLOG_DB_ID,
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
        const cover = page.cover
        if (!cover) return { ...page, cover: null }
        const imageUrl = cover.type === "external" ? cover.external.url : cover.file.url
        if (!imageUrl) return { ...page, cover: null }
        const url = await upload(imageUrl)
        return { ...page, cover: url }
      }),
    )
  },
  ["blog"],
  { revalidate: 86400, tags: ["blog"] },
)

export default async function Page() {
  const items = await getItems()
  return (
    <div className="px-4 py-8">
      <div className="mx-auto max-w-6xl  space-y-6">
        <div>
          <h1 className="text-4xl font-bold">ramblings</h1>
          <p className="font-light">
            <i className="opacity-70">noun</i> <span className="opacity-70">[plural]</span>: writing that goes on for a while and
            doesn't seem to have any clear organization or purpose
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => {
            const page = formatPageProperties(item)
            if (!page.slug) return null
            return (
              <Link
                key={page.id}
                href={`/blog/${page.slug.toLocaleLowerCase()}`}
                className="p-4 space-y-2 border rounded-sm hover:border-gray-600 duration-200 cursor-pointer"
              >
                {page.cover && (
                  <Image
                    src={page.cover}
                    unoptimized={!page.cover.startsWith("https://cdn.ramble")}
                    alt={page.title}
                    width={600}
                    height={300}
                    className="rounded-sm h-[300px] w-full object-cover"
                  />
                )}
                <p className="opacity-60">{dayjs(page.publishedAt).format("Do MMMM YYYY")}</p>
                <p className="text-2xl font-semibold leading-8">{page.title}</p>
                <p className="line-clamp-3 font-light">{page.summary}</p>
                <div className="flex flex-wrap gap-2">
                  {page.tags.map((tag) => (
                    <Tag key={tag.id} tag={tag} />
                  ))}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const formatPageProperties = (page: Omit<PageObjectResponse, "cover"> & { cover: string | null }) => {
  // return page properties as a flat object
  const properties = page.properties

  return {
    id: page.id,
    title: properties.Title.type === "title" ? properties.Title.title[0].plain_text : "",
    summary: properties.Summary.type === "rich_text" ? properties.Summary.rich_text[0]?.plain_text : null,
    tags: properties.Tags.type === "multi_select" ? properties.Tags.multi_select : [],
    publishedAt: properties.Published.type === "date" ? properties.Published.date?.start! : "",
    cover: page.cover,
    slug: properties.Slug.type === "rich_text" ? properties.Slug.rich_text[0]!.plain_text! : "",
  }
}
