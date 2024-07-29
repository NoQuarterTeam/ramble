import { requireAdmin } from "@/lib/server/auth"
import { notion } from "@/lib/server/notion"
import { upload } from "@/lib/server/s3"
import type { BlockObjectResponse, PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import dayjs from "dayjs"
import { unstable_cache } from "next/cache"
import { notFound } from "next/navigation"
import { BLOG_NOTION_DB_ID, BLOG_S3_FOLDER } from "../config"

export const getBlogContent = (slug: string) =>
  unstable_cache(
    async () => {
      const pages = await notion.databases.query({
        database_id: BLOG_NOTION_DB_ID,
        page_size: 1,
        filter: {
          and: [
            { property: "Published", date: { is_not_empty: true, before: dayjs().format() } },
            { property: "Slug", rich_text: { equals: slug } },
          ],
        },
      })
      const page = pages.results[0] as PageObjectResponse
      if (!page) notFound()
      return formatContent(page)
    },
    ["blog-detail", slug],
    { revalidate: 86400, tags: ["blog-detail", `blog-detail:${slug}`] },
  )()

export const getBlogPreviewContent = async (slug: string) => {
  await requireAdmin()
  const pages = await notion.databases.query({
    database_id: BLOG_NOTION_DB_ID,
    page_size: 1,
    filter: {
      and: [
        { property: "Published", date: { is_not_empty: true } },
        { property: "Slug", rich_text: { equals: slug } },
      ],
    },
  })
  const page = pages.results[0] as PageObjectResponse
  if (!page) notFound()
  return formatContent(page)
}

async function formatContent(page: PageObjectResponse) {
  // check name and typeguard that its a title property
  const properties = page.properties
  const titleProperty = properties.Title
  if (titleProperty.type !== "title") notFound()
  const coverFile = page.cover || null
  const imageUrl = coverFile ? (coverFile.type === "external" ? coverFile.external.url : coverFile.file.url) : null
  let cover = null
  if (imageUrl) cover = await upload(imageUrl, BLOG_S3_FOLDER)
  const pageContent = await notion.blocks.children.list({ block_id: page.id })

  return {
    title: properties.Title?.type === "title" ? properties.Title.title[0].plain_text : "",
    summary: properties.Summary?.type === "rich_text" ? properties.Summary.rich_text[0]?.plain_text : null,
    tags: properties.Tags?.type === "multi_select" ? properties.Tags.multi_select : [],
    publishedAt: properties.Published?.type === "date" ? properties.Published.date?.start : null,
    cover,
    coverSource: properties["Cover source"]?.type === "rich_text" ? properties["Cover source"]?.rich_text?.[0]?.plain_text : null,
    coverSourceUrl: properties["Cover source url"]?.type === "url" ? properties["Cover source url"]?.url : null,
    content: await Promise.all(
      (pageContent.results as BlockObjectResponse[]).map(async (block) => {
        if (block.type === "image" && block.image.type === "file") {
          const imageUrl = block.image.file.url
          const url = await upload(imageUrl, BLOG_S3_FOLDER)
          return { ...block, image: { ...block.image, file: { ...block.image.file, url } } }
        }
        if (block.type === "video" && block.video.type === "file") {
          const videoUrl = block.video.file.url
          const url = await upload(videoUrl, BLOG_S3_FOLDER)
          return { ...block, video: { ...block.video, file: { ...block.video.file, url } } }
        }
        return block
      }),
    ),
  }
}

export type FormattedPage = Awaited<ReturnType<typeof formatContent>>
