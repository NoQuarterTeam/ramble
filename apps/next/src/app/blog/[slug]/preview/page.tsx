import dayjs from "dayjs"
import advancedFormat from "dayjs/plugin/advancedFormat"
import type { Metadata } from "next"
import { BlogDetail } from "../BlogDetail"
import { getBlogPreviewContent } from "../getBlogData"
dayjs.extend(advancedFormat)

export const generateMetadata = async ({ params: { slug } }: { params: { slug: string } }): Promise<Metadata> => {
  const { title, summary, cover } = await getBlogPreviewContent(slug)
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
export const dynamic = "force-dynamic"

export default async function Page({ params }: { params: { slug: string } }) {
  const page = await getBlogPreviewContent(params.slug)
  return <BlogDetail page={page} />
}
