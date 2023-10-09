import * as React from "react"
import type { ActionFunctionArgs, LoaderFunctionArgs, SerializeFrom } from "@vercel/remix"
import { Heart, Plus } from "lucide-react"
import { useAuthenticityToken } from "remix-utils/csrf/react"
import { z } from "zod"
import { zx } from "zodix"

import { useDisclosure } from "@ramble/shared"

import { FormButton, FormError, FormField, useFetcher } from "~/components/Form"
import {
  Button,
  Checkbox,
  IconButton,
  Modal,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  Tooltip,
} from "~/components/ui"
import { track } from "~/lib/analytics.server"
import { db } from "~/lib/db.server"
import type { ActionDataErrorResponse } from "~/lib/form"
import { FORM_ACTION, FormActionInput, formError, getFormAction, validateFormData } from "~/lib/form"
import { badRequest, json } from "~/lib/remix.server"
import { requireUser } from "~/services/auth/auth.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUser(request)
  const lists = await db.list.findMany({
    where: { creatorId: userId },
    select: { id: true, name: true, listSpots: { select: { spotId: true } } },
    orderBy: { createdAt: "desc" },
  })
  return json(lists)
}

enum Actions {
  ToggleSave = "toggle-save",
  CreateAndSaveToList = "create-and-save-to-list",
}

const createListSchema = z.object({ name: z.string().min(1), description: z.string().optional(), spotId: z.string() })

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUser(request)
  const formAction = await getFormAction<Actions>(request)
  switch (formAction) {
    case Actions.ToggleSave:
      try {
        const schema = z.object({ shouldSave: zx.BoolAsString, listId: z.string(), spotId: z.string() })
        const result = await validateFormData(request, schema)
        if (!result.success) return badRequest("Error saving to list", request, { flash: { title: "Error saving to list" } })
        const { shouldSave, listId, spotId } = result.data
        await db.list.findFirstOrThrow({ select: { id: true }, where: { id: listId, creator: { id: userId } } })
        const listSpot = await db.listSpot.findFirst({ where: { listId, spotId, list: { creator: { id: userId } } } })

        if (shouldSave) {
          if (listSpot) return badRequest("Already saved to list", request, { flash: { title: "Already saved to list" } })
          await db.listSpot.create({ data: { listId, spotId } })
          track("Saved to list", { listId, spotId })
          return json({ success: true }, request, { flash: { title: "Saved to list" } })
        } else {
          if (!listSpot) return badRequest("Not saved to list", request, { flash: { title: "Not saved to list" } })
          await db.listSpot.delete({ where: { id: listSpot.id } })
          track("Removed from list", { listId, spotId })
          return json({ success: true }, request, { flash: { title: "Removed from list" } })
        }
      } catch {
        return badRequest("Request failed", request, { flash: { title: "Failed to save" } })
      }
    case Actions.CreateAndSaveToList:
      try {
        const result = await validateFormData(request, createListSchema)
        if (!result.success) return formError(result)
        const { name, description, spotId } = result.data
        const list = await db.list.create({ data: { name, description, creatorId: userId, listSpots: { create: { spotId } } } })
        track("Saved to new list", { listId: list.id, spotId })
        return json({ success: true }, request, { flash: { title: "List created", description: "Spot saved to new list" } })
      } catch {
        return formError({ formError: "Failed to create list" })
      }
    default:
      return badRequest("Invalid action", request, { flash: { title: "Invalid action" } })
  }
}
const SAVE_TO_LIST_URL = "/api/save-to-list"

interface Props {
  spotId: string
  trigger?: React.ReactElement
}

export function SaveToList(props: Props) {
  const listsFetcher = useFetcher<typeof loader>()
  const popoverProps = useDisclosure()
  const newListModalProps = useDisclosure()
  const lists = listsFetcher.data

  React.useEffect(() => {
    if (!popoverProps.isOpen) return
    listsFetcher.load(SAVE_TO_LIST_URL)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popoverProps.isOpen])

  const listCreateFetcher = useFetcher<ActionDataErrorResponse<typeof createListSchema> | { success: true }>()

  React.useEffect(() => {
    if (listCreateFetcher.data?.success) {
      newListModalProps.onClose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listCreateFetcher.data])
  const trigger = props.trigger && React.cloneElement(props.trigger, { onClick: popoverProps.onOpen })
  return (
    <Popover {...popoverProps}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="outline" onClick={popoverProps.onOpen} leftIcon={<Heart className="sq-4" />} aria-label="favourite">
            Save
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        onOpenAutoFocus={(e) => {
          e.preventDefault()
        }}
        side="bottom"
        align="end"
      >
        <PopoverArrow />
        <div className="space-y-2 p-2">
          <div className="flex items-center justify-between">
            <p className="pl-1">Save to list</p>
            <Tooltip label="New list">
              <IconButton
                onClick={newListModalProps.onOpen}
                size="xs"
                variant="outline"
                icon={<Plus className="sq-2" />}
                aria-label="new"
              />
            </Tooltip>
          </div>
          {listsFetcher.state === "loading" && !lists ? (
            <div className="center p-4">
              <Spinner />
            </div>
          ) : !lists ? null : lists.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-3 p-3">
              <p>You haven't got any lists yet</p>
              <Button variant="outline" onClick={newListModalProps.onOpen}>
                Create a new list
              </Button>
            </div>
          ) : (
            lists.map((list) => (
              <ListItem
                key={list.id}
                spotId={props.spotId}
                list={list}
                isSaved={!!list.listSpots.find((s) => s.spotId === props.spotId)}
              />
            ))
          )}
          <Modal title="Create new list" {...newListModalProps}>
            <listCreateFetcher.Form className="space-y-2" action={SAVE_TO_LIST_URL}>
              <input type="hidden" name="spotId" value={props.spotId} />
              <FormField
                required
                errors={!listCreateFetcher.data?.success ? listCreateFetcher.data?.fieldErrors?.name : undefined}
                name="name"
                label="Name"
              />
              <FormField name="description" label="Description" />
              <FormError error={!listCreateFetcher.data?.success ? listCreateFetcher.data?.formError : undefined} />
              <FormActionInput value={Actions.CreateAndSaveToList} />
              <FormButton isLoading={listCreateFetcher.state === "submitting"}>Create</FormButton>
            </listCreateFetcher.Form>
          </Modal>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function ListItem({ list, isSaved, spotId }: { spotId: string; list: SerializeFrom<typeof loader>[number]; isSaved: boolean }) {
  const listFetcher = useFetcher<typeof action>()
  const csrf = useAuthenticityToken()
  return (
    <Button
      disabled={listFetcher.state === "submitting"}
      className="w-full px-2"
      onClick={() =>
        listFetcher.submit(
          { [FORM_ACTION]: Actions.ToggleSave, shouldSave: String(!isSaved), listId: list.id, spotId, csrf },
          { method: "POST", action: SAVE_TO_LIST_URL },
        )
      }
      size="md"
      variant="outline"
    >
      <div className="flex w-full items-center justify-between">
        <span>{list.name}</span>
        <Checkbox readOnly checked={isSaved} />
      </div>
    </Button>
  )
}
