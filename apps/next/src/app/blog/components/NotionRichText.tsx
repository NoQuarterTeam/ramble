import type { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints"
import { join } from "@ramble/shared"

export function NotionRichText({ richText }: { richText: RichTextItemResponse | null }) {
  if (!richText) return null
  if (richText.type !== "text") return null
  if (richText.text.link) {
    return (
      <a
        href={richText.text.link.url}
        className={join("inline-block underline hover:opacity-75 text-primary", richText.annotations.bold && "font-semibold")}
        target="_blank"
        rel="noreferrer noopener"
      >
        {richText.text.content}
      </a>
    )
  }
  return <span className={join("", richText.annotations.bold && "font-bold")}>{richText.text.content}</span>
}
