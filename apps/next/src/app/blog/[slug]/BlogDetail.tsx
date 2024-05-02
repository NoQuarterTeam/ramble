import dayjs from "dayjs"
import Image from "next/image"
import { NotionBlock } from "../components/NotionBlock"
import { Tag } from "../components/Tag"
import type { FormattedPage } from "./getBlogData"

export function BlogDetail({ page }: { page: FormattedPage }) {
  return (
    <>
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
        <div className="relative">
          <Image
            src={page.cover}
            unoptimized={!page.cover.startsWith("https://cdn.ramble")}
            alt={page.title}
            width={800}
            height={350}
            className="w-full h-[350px] object-cover rounded-sm"
          />
          {page.coverSource && page.coverSourceUrl && (
            <a
              href={page.coverSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-1 text-xs right-1 bg-background px-2 py-1 rounded-sm hover:opacity-75"
            >
              Photo by {page.coverSource}
            </a>
          )}
        </div>
      )}
      <div>
        {page.content.map((block) => (
          <NotionBlock key={block.id} block={block} />
        ))}
      </div>
    </>
  )
}
