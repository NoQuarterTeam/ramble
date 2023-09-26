import * as React from "react"
import type { SerializeFrom } from "@vercel/remix"
import { Star } from "lucide-react"

import type { Review, Spot, SpotImage } from "@ramble/database/types"
import { createImageUrl } from "@ramble/shared"

import { Form, FormButton, FormError, FormField } from "~/components/Form"
import { LinkButton } from "~/components/LinkButton"
import { OptimizedImage } from "~/components/OptimisedImage"
import { PageContainer } from "~/components/PageContainer"
import { IconButton, Textarea } from "~/components/ui"
import { FormActionInput } from "~/lib/form"

import { Actions } from "../spots.$id_.reviews.$reviewId"

interface Props {
  spot: SerializeFrom<Pick<Spot, "name"> & { images: Pick<SpotImage, "path" | "blurHash">[] }>
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
          {review && <FormActionInput value={Actions.Edit} />}
          <FormField
            defaultValue={review?.description || ""}
            placeholder="How was your stay? what did you like?"
            name="description"
            input={<Textarea rows={5} />}
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
          <FormError />
          <div className="flex space-x-1">
            <FormButton>Save</FormButton>
            <LinkButton
              variant="ghost"
              // @ts-expect-error -1 is valid
              to={-1}
            >
              Cancel
            </LinkButton>
          </div>
        </Form>

        <div className="grid grid-cols-4 gap-2">
          {spot.images[0] && (
            <OptimizedImage
              className="rounded-xs col-span-4 h-[300px] w-full"
              height={300}
              width={600}
              placeholder={spot.images[0].blurHash}
              alt="spot 1"
              src={createImageUrl(spot.images[0].path)}
            />
          )}
          {spot.images[1] && (
            <OptimizedImage
              placeholder={spot.images[1].blurHash}
              className="rounded-xs col-span-2 h-[200px] w-full"
              height={200}
              width={400}
              alt="spot 2"
              src={createImageUrl(spot.images[1].path)}
            />
          )}
          {spot.images[2] && (
            <OptimizedImage
              placeholder={spot.images[2].blurHash}
              className="rounded-xs col-span-2 h-[200px] w-full"
              height={200}
              width={400}
              alt="spot 3"
              src={createImageUrl(spot.images[2].path)}
            />
          )}
        </div>
      </div>
    </PageContainer>
  )
}
