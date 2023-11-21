import * as React from "react"
import { Bug, Lightbulb, MessageCircle } from "lucide-react"

import { type FeedbackType } from "@ramble/database/types"
import { useDisclosure } from "@ramble/shared"

import { Form, FormError, FormField, useFetcher } from "~/components/Form"
import {
  Button,
  CloseButton,
  Popover,
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
  Textarea,
} from "~/components/ui"
import { type ActionDataErrorResponse } from "~/lib/form.server"
import { type CreateSchema, feedbackActions } from "~/services/api/feedback.server"

const actionUrl = "/api/feedback"

export enum Actions {
  Create = "create",
}

export const action = feedbackActions

export function Feedback() {
  const feedbackProps = useDisclosure()

  return (
    <Popover open={feedbackProps.isOpen} onOpenChange={feedbackProps.onSetIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">Feedback</Button>
      </PopoverTrigger>

      <PopoverPortal>
        <PopoverContent align="end" side="bottom" className="w-min p-2">
          <FeedbackForm onClose={feedbackProps.onClose} />
          <PopoverArrow />
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  )
}

const feedbackTypes = [
  { label: "Issue", value: "ISSUE", icon: Bug },
  { label: "Idea", value: "IDEA", icon: Lightbulb },
  { label: "Other", value: "OTHER", icon: MessageCircle },
]

function FeedbackForm({ onClose }: { onClose: () => void }) {
  const key = "feedback"
  const [type, setType] = React.useState<FeedbackType | null>()
  const feedbackFetcher = useFetcher<ActionDataErrorResponse<CreateSchema> | { success: true }>({
    key,
    onFinish: (data) => {
      if (data?.success) {
        onClose()
        setType(null)
      }
    },
  })
  const title = type
    ? type === "IDEA"
      ? "What could make Ramble better?"
      : type === "ISSUE"
        ? "What seems to be the problem?"
        : "Let us know your thoughts"
    : "What kind of feedback do you have?"

  return (
    <Form fetcherKey={key} action={actionUrl}>
      <div className="flex items-center justify-between pb-2">
        <h3 className="text-md">{title}</h3>
        <PopoverClose>
          <CloseButton size="xs" />
        </PopoverClose>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-center space-x-1">
          {feedbackTypes.map((type) => (
            <label
              key={type.value}
              htmlFor={type.value}
              className="rounded-xs flex w-full cursor-pointer items-center space-x-3 border border-gray-200 p-2 hover:opacity-70 dark:border-gray-700"
            >
              <input
                required
                className="text-primary bg-transparent"
                id={type.value}
                name="type"
                type="radio"
                value={type.value}
              />
              <span>{type.label}</span>
              <type.icon className="sq-5 opacity-70" />
            </label>
          ))}
        </div>
        <FormField fetcherKey={key} required placeholder="Your feedback" name="message" input={<Textarea rows={5} />} />
        <FormError fetcherKey={key} />
        <div className="flex justify-between">
          <PopoverClose>
            <Button variant="ghost">Cancel</Button>
          </PopoverClose>
          <feedbackFetcher.FormButton value={Actions.Create}>Send</feedbackFetcher.FormButton>
        </div>
      </div>
    </Form>
  )
}
