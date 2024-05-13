import dayjs from "dayjs"
import advancedFormat from "dayjs/plugin/advancedFormat"
import Image from "next/image"
import Link from "next/link"
import { Tag } from "./components/Tag"
import { getBlogPosts } from "./getBlogPosts"
dayjs.extend(advancedFormat)

export default async function Page() {
  const items = await getBlogPosts()
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
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/blog/${item.slug.toLocaleLowerCase()}`}
              className="p-4 space-y-2 border rounded-sm hover:border-gray-600 duration-200 cursor-pointer"
            >
              {item.cover && (
                <Image
                  src={item.cover}
                  unoptimized={!item.cover.startsWith("https://cdn.ramble")}
                  alt={item.title}
                  width={600}
                  height={300}
                  className="rounded-sm h-[300px] w-full object-cover"
                />
              )}
              <p className="opacity-60">{dayjs(item.publishedAt).format("Do MMMM YYYY")}</p>
              <p className="text-2xl font-semibold leading-8">{item.title}</p>
              <p className="line-clamp-3 font-light">{item.summary}</p>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <Tag key={tag.id} tag={tag} />
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
