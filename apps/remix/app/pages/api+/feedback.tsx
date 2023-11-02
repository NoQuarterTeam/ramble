import * as React from "react"
import { Bug, Lightbulb, MessageCircle } from "lucide-react"

import { type FeedbackType } from "@ramble/database/types"
import { useDisclosure } from "@ramble/shared"

import { FormError, FormField, useFetcher } from "~/components/Form"
import { Button, Modal, Textarea } from "~/components/ui"
import { type ActionDataErrorResponse } from "~/lib/form.server"
import { type CreateSchema, feedbackActions } from "~/services/api/feedback.server"

const actionUrl = "/api/feedback"

export enum Actions {
  Create = "create",
}

export const action = feedbackActions

export function Feedback() {
  const feedbackModalProps = useDisclosure()

  return (
    <>
      <Button onClick={feedbackModalProps.onOpen} variant="outline">
        Feedback
      </Button>

      <Modal {...feedbackModalProps}>
        <FeedbackForm onClose={feedbackModalProps.onClose} />
      </Modal>
    </>
  )
}

function FeedbackForm({ onClose }: { onClose: () => void }) {
  const [type, setType] = React.useState<FeedbackType | null>()
  const feedbackFetcher = useFetcher<ActionDataErrorResponse<CreateSchema> | { success: true }>({
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
    <div>
      <h3 className="text-xl">{title}</h3>
      {type ? (
        <feedbackFetcher.Form action={actionUrl}>
          <div className="space-y-2 p-4">
            <FormField
              required
              autoFocus
              placeholder="Your feedback"
              defaultValue={(feedbackFetcher.formData?.get("message") as string) || ""}
              name="message"
              input={<Textarea rows={5} />}
            />
            <input type="hidden" name="type" value={type} />
            <FormError />
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setType(null)}>
                Change type
              </Button>
              <feedbackFetcher.FormButton value={Actions.Create}>Send</feedbackFetcher.FormButton>
            </div>
          </div>
        </feedbackFetcher.Form>
      ) : (
        <div className="flex items-center justify-center space-x-4 px-4 py-8">
          <Button variant="secondary" className="sq-24" onClick={() => setType("ISSUE")}>
            <div className="vstack">
              <Bug className="sq-4" />
              <p>Issue</p>
            </div>
          </Button>
          <Button variant="secondary" className="sq-24" onClick={() => setType("IDEA")}>
            <div className="vstack">
              <Lightbulb className="sq-4" />
              <p>Idea</p>
            </div>
          </Button>
          <Button variant="secondary" className="sq-24" onClick={() => setType("OTHER")}>
            <div className="vstack">
              <MessageCircle className="sq-4" />
              <p>Other</p>
            </div>
          </Button>
        </div>
      )}
    </div>
  )
}
