import * as React from "react"

import type { SerializeFrom } from "@vercel/remix"
import { Star } from "lucide-react"

import type { Review, Spot, SpotImage } from "@ramble/database/types"
import { createImageUrl } from "@ramble/shared"
import { IconButton, Textarea } from "@ramble/ui"

import { Form, FormButton, FormError, FormField } from "~/components/Form"
import { PageContainer } from "~/components/PageContainer"
import { FormAction } from "~/lib/form"

import { Actions } from "../spots.$id.reviews.$reviewId"

interface Props {
  spot: SerializeFrom<Pick<Spot, "name"> & { images: Pick<SpotImage, "path">[] }>
  review?: SerializeFrom<Pick<Review, "rating" | "description">>
}

export function ReviewForm({ spot, review }: Props) {
  const [rating, setRating] = React.useState(review?.rating || 0)
  return (
    <PageContainer>
      <div>
        <h1 className="text-3xl">{review ? `Edit review for ${spot.name}` : `New review for ${spot.name}`}</h1>
        <p className="opacity-75">Be nice, be honest.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Form className="space-y-2">
          {review && <FormAction value={Actions.Edit} />}
          <FormField
            defaultValue={review?.description || ""}
            placeholder="How was your stay? what did you like?"
            name="description"
            input={<Textarea rows={8} />}
          />
          <div className="flex space-x-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <IconButton
                variant="ghost"
                aria-label={`star ${i + 1}`}
                key={i}
                onClick={() => setRating(i + 1)}
                icon={<Star className={rating > i ? "fill-black dark:fill-white" : ""} />}
              />
            ))}
          </div>
          <input name="rating" type="hidden" value={rating} />
          <FormButton>Save</FormButton>
          <FormError />
        </Form>

        <div className="grid grid-cols-4 gap-2">
          <img
            className="col-span-4 h-[200px] w-full rounded-md object-cover"
            height={200}
            width={600}
            alt="spot 1"
            src={createImageUrl(spot.images[0].path)}
          />
          <img
            className="col-span-2 h-[200px] w-full rounded-md object-cover"
            height={200}
            alt="spot 2"
            src={createImageUrl(spot.images[1].path)}
          />
          <img
            className="col-span-2 h-[200px] w-full rounded-md object-cover"
            width={600}
            alt="spot 3"
            src={createImageUrl(spot.images[2].path)}
          />
        </div>
      </div>
    </PageContainer>
  )
}
