import * as React from "react"
import { Heart, Plus } from "lucide-react"
import { useAuthenticityToken } from "remix-utils/csrf/react"

import { useDisclosure } from "@ramble/shared"

import { Form, FormError, FormField, useFetcher } from "~/components/Form"
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
import { db } from "~/lib/db.server"
import { FORM_ACTION } from "~/lib/form"
import type { ActionDataErrorResponse } from "~/lib/form.server"
import { useFetcherQuery } from "~/lib/hooks/useFetcherQuery"
import { json } from "~/lib/remix.server"
import type { LoaderFunctionArgs, SerializeFrom } from "~/lib/vendor/vercel.server"
import { saveToListActions, type CreateListSchema } from "~/services/api/save-to-list.server"
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

export enum Actions {
  ToggleSave = "toggle-save",
  CreateAndSaveToList = "create-and-save-to-list",
}

export const action = saveToListActions

const SAVE_TO_LIST_URL = "/api/save-to-list"

interface Props {
  spotId: string
  trigger?: React.ReactElement
}

const key = "save-to-list"
export function SaveToList(props: Props) {
  const popoverProps = useDisclosure()
  const listsFetcher = useFetcherQuery<typeof loader>(SAVE_TO_LIST_URL, { isEnabled: popoverProps.isOpen })
  const newListModalProps = useDisclosure()
  const lists = listsFetcher.data

  const listCreateFetcher = useFetcher<ActionDataErrorResponse<CreateListSchema> | { success: true }>({
    key,
    onFinish: (data) => {
      if (data?.success) {
        newListModalProps.onClose()
      }
    },
  })

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
            <div className="center px-4 pb-2">
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
            <Form fetcherKey={key} className="space-y-2" action={SAVE_TO_LIST_URL}>
              <input type="hidden" name="spotId" value={props.spotId} />
              <FormField fetcherKey={key} required name="name" label="Name" />
              <FormField fetcherKey={key} name="description" label="Description" />
              <FormError fetcherKey={key} />
              <listCreateFetcher.FormButton value={Actions.CreateAndSaveToList}>Create</listCreateFetcher.FormButton>
            </Form>
          </Modal>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function ListItem({ list, isSaved, spotId }: { spotId: string; list: SerializeFrom<typeof loader>[number]; isSaved: boolean }) {
  const listFetcher = useFetcher<typeof action>()
  const csrf = useAuthenticityToken()

  const shouldBeChecked = listFetcher.state !== "idle" ? listFetcher.formData?.get("shouldSave") === "true" : isSaved

  return (
    <Button
      disabled={listFetcher.state !== "idle"}
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
        <Checkbox readOnly checked={shouldBeChecked} />
      </div>
    </Button>
  )
}
