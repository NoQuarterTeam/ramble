import { BLOG_DB_ID, notion } from "@/lib/notion"
import { upload } from "@/lib/s3"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { unstable_cache } from "next/cache"
import Link from "next/link"

const getItems = async () => {
  const content = await notion.databases.query({
    database_id: BLOG_DB_ID,
    filter: {
      and: [
        { property: "Published", date: { is_not_empty: true } },
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
}

export default async function Page() {
  const items = await getItems()
  return (
    <div className="mx-auto max-w-6xl py-8 space-y-6">
      <h1 className="text-4xl font-bold">blog</h1>
      <div className="grid grid-cols-2 gap-6">
        {items.map((item) => {
          const props = formatPageProperties(item)
          if (!props.slug) return null
          return (
            <Link
              key={props.id}
              href={`/blog/${props.slug.toLocaleLowerCase()}`}
              className="p-4 grow-0 space-y-2 border rounded-sm hover:shadow-sm transition-shadow duration-200 cursor-pointer"
            >
              <p className="text-xl font-semibold">{props.title}</p>
              <p className="line-clamp-3">{props.summary}</p>
              <p className="opacity-60">{props.publishedAt}</p>
              <div className="flex space-x-2">
                {props.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-sm bg-primary-100 text-primary-800 px-3 py-1 rounded-full dark:bg-primary-900 dark:text-primary-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          )
        })}
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
    tags: properties.Tags.type === "multi_select" ? properties.Tags.multi_select.map((tag) => tag.name) : [],
    image: page.cover,
    slug:
      properties.Slug.type === "rich_text"
        ? properties.Slug.rich_text.length > 0
          ? properties.Slug.rich_text[0]?.plain_text
          : null
        : null,
    publishedAt: properties.Published.type === "date" ? properties.Published.date?.start : null,
  }
}
