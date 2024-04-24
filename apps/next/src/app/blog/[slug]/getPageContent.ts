import { BLOG_DB_ID, notion } from "@/lib/notion"
import { upload } from "@/lib/s3"
import type { BlockObjectResponse, PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import dayjs from "dayjs"
import { unstable_cache } from "next/cache"
import { redirect } from "next/navigation"

export const getPageContent = unstable_cache(
  async (slug: string) => {
    const pages = await notion.databases.query({
      database_id: BLOG_DB_ID,
      page_size: 1,
      filter: {
        and: [
          { property: "Published", date: { is_not_empty: true, before: dayjs().format() } },
          { property: "Slug", rich_text: { equals: slug } },
        ],
      },
    })

    const page = pages.results[0] as PageObjectResponse
    if (!page) return redirect("/")

    // check name and typeguard that its a title property
    const properties = page.properties
    const titleProperty = properties.Title
    if (titleProperty.type !== "title") redirect("/")
    const coverFile = page.cover || null
    const imageUrl = coverFile ? (coverFile.type === "external" ? coverFile.external.url : coverFile.file.url) : null
    let cover = null
    if (imageUrl) cover = await upload(imageUrl)
    const pageContent = await notion.blocks.children.list({ block_id: page.id })
    return {
      title: properties.Title.type === "title" ? properties.Title.title[0].plain_text : "",
      summary: properties.Summary.type === "rich_text" ? properties.Summary.rich_text[0]?.plain_text : null,
      tags: properties.Tags.type === "multi_select" ? properties.Tags.multi_select.map((tag) => tag.name) : [],
      publishedAt: properties.Published.type === "date" ? properties.Published.date?.start : null,
      cover,
      content: await Promise.all(
        (pageContent.results as BlockObjectResponse[]).map(async (block) => {
          if (block.type === "image" && block.image.type === "file") {
            const imageUrl = block.image.file.url
            const url = await upload(imageUrl)
            return { ...block, image: { ...block.image, file: { ...block.image.file, url } } }
          }
          if (block.type === "video" && block.video.type === "file") {
            const videoUrl = block.video.file.url
            const url = await upload(videoUrl)
            return { ...block, video: { ...block.video, file: { ...block.video.file, url } } }
          }
          return block
        }),
      ),
    }
  },
  ["blog-detail"],
  { revalidate: 86400 },
)
