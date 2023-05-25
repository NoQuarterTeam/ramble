import { Button, Checkbox, Popover, PopoverArrow, PopoverContent, PopoverTrigger } from "@ramble/ui"
import { useFetcher } from "@remix-run/react"
import type { ActionArgs, SerializeFrom } from "@vercel/remix"

import { Heart } from "lucide-react"
import * as React from "react"
import type { spotListsLoader } from "./$spotId.lists"
import { badRequest, json } from "~/lib/remix.server"
import { zx } from "zodix"
import { validateFormData } from "~/lib/form"
import { z } from "zod"
import { requireUser } from "~/services/auth/auth.server"
import { db } from "~/lib/db.server"

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireUser(request)
  const { spotId, listId } = params
  if (!spotId || !listId) return badRequest("Spot and list missing")

  const schema = z.object({ shouldSave: zx.BoolAsString })
  const result = await validateFormData(request, schema)
  if (!result.success) return badRequest("Error saving to list", request, { flash: { title: "Error saving to list" } })

  const { shouldSave } = result.data
  await db.list.findFirstOrThrow({ select: { id: true }, where: { id: listId, creator: { id: userId } } })
  const listSpot = await db.listSpot.findFirst({ where: { listId, spotId, list: { creator: { id: userId } } } })

  if (shouldSave) {
    if (listSpot) return badRequest("Already saved to list", request, { flash: { title: "Already saved to list" } })
    await db.listSpot.create({ data: { listId, spotId } })
    return json({ success: true }, request, { flash: { title: "Saved to list" } })
  } else {
    if (!listSpot) return badRequest("Not saved to list", request, { flash: { title: "Not saved to list" } })
    await db.listSpot.delete({ where: { id: listSpot.id } })
    return json({ success: true }, request, { flash: { title: "Removed from list" } })
  }
}
interface Props {
  spotId: string
}

export function SaveToList(props: Props) {
  const listsFetcher = useFetcher<typeof spotListsLoader>()
  const lists = listsFetcher.data
  React.useEffect(() => {
    listsFetcher.load(`/api/${props.spotId}/lists`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" leftIcon={<Heart className="sq-4" />} aria-label="favourite">
          Save
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end">
        <PopoverArrow />
        <div className="space-y-1 p-2">
          <p>Save to list</p>
          {!lists || lists.length === 0
            ? null
            : lists.map((list) => (
                <ListItem
                  key={list.id}
                  spotId={props.spotId}
                  list={list}
                  isSaved={!!list.listSpots.find((s) => s.spotId === props.spotId)}
                />
              ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function ListItem({
  list,
  isSaved,
  spotId,
}: {
  spotId: string
  list: SerializeFrom<typeof spotListsLoader>[number]
  isSaved: boolean
}) {
  const listFetcher = useFetcher<typeof action>()

  return (
    <Button
      type="submit"
      isLoading={listFetcher.state === "submitting"}
      className="w-full"
      onClick={() =>
        listFetcher.submit(
          { shouldSave: String(!isSaved) },
          { method: "post", replace: true, action: `/api/${spotId}/save-to-list/${list.id}` },
        )
      }
      size="sm"
      variant="outline"
      key={list.id}
    >
      <div className="flex w-full items-center justify-between">
        <span>{list.name}</span>
        <Checkbox readOnly checked={isSaved} />
      </div>
    </Button>
  )
}
