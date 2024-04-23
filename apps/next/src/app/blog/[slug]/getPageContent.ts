import { BLOG_DB_ID, notion } from "@/lib/notion"
import { upload } from "@/lib/s3"
import type { BlockObjectResponse, PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { redirect } from "next/navigation"
import { cache } from "react"

export const getPageContent = cache(async (slug: string) => {
  const pages = await notion.databases.query({
    database_id: BLOG_DB_ID,
    page_size: 1,
    filter: {
      and: [
        { property: "Published", date: { is_not_empty: true } },
        { property: "Slug", rich_text: { equals: slug } },
      ],
    },
  })

  const page = pages.results[0] as PageObjectResponse
  if (!page) return redirect("/")

  // check name and typeguard that its a title property
  const titleProperty = page.properties.Title
  if (titleProperty.type !== "title") redirect("/")
  const title = titleProperty.title[0]?.plain_text

  const pageContent = await notion.blocks.children.list({ block_id: page.id })
  return {
    title,
    page,
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
})
