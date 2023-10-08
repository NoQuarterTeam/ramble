import { sendFeedbackSentToAdminsEmail } from "@ramble/api"
import { FeedbackType } from "@ramble/database/types"
import { useDisclosure } from "@ramble/shared"
import { track } from "@vercel/analytics/server"
import { ActionFunctionArgs } from "@vercel/remix"
import { Bug, Lightbulb, MessageCircle } from "lucide-react"
import * as React from "react"
import { promiseHash } from "remix-utils/promise"
import { z } from "zod"
import { FormButton, FormError, FormField, useFetcher } from "~/components/Form"
import { Button, Modal, Textarea } from "~/components/ui"
import { db } from "~/lib/db.server"
import { ActionDataErrorResponse, FormActionInput, formError, getFormAction, validateFormData } from "~/lib/form"
import { badRequest, json } from "~/lib/remix.server"
import { getCurrentUser } from "~/services/auth/auth.server"

export const actionUrl = "/api/feedback"

export enum FeedbackMethods {
  CreateFeedback = "createFeedback",
}
const schema = z.object({ message: z.string().min(1), type: z.nativeEnum(FeedbackType) })

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getCurrentUser(request)
  const formAction = await getFormAction(request)

  switch (formAction) {
    case FeedbackMethods.CreateFeedback:
      try {
        const result = await validateFormData(request, schema)
        if (!result.success) return formError(result)
        const { feedback, admins } = await promiseHash({
          feedback: db.feedback.create({ data: { ...result.data, userId: user.id }, include: { user: true } }),
          admins: db.user.findMany({ where: { isAdmin: true }, select: { email: true } }),
        })
        await sendFeedbackSentToAdminsEmail(
          admins.map((a) => a.email),
          feedback,
        )
        track("Feedback created", { feedbackId: feedback.id, userId: user.id })
        return json({ success: true }, request, {
          flash: { type: "success", title: "Feedback sent", description: "We'll take a look as soon as possible" },
        })
      } catch (e: unknown) {
        return badRequest(e instanceof Error ? e.message : "Error", request, {
          flash: { type: "error", title: "Error creating feedback" },
        })
      }
    default:
      return badRequest("Invalid action", request, { flash: { type: "error", title: "Error creating feedback" } })
  }
}

export function Feedback() {
  const [type, setType] = React.useState<FeedbackType | null>()
  const feedbackModalProps = useDisclosure()
  const feedbackFetcher = useFetcher<ActionDataErrorResponse<typeof schema> | { success: true }>({
    onFinish: (data) => {
      if (data?.success) {
        feedbackModalProps.onClose()
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
    <>
      <Button onClick={feedbackModalProps.onOpen} variant="outline">
        <span className="hidden md:block">Give feedback</span>
        <span className="block md:hidden">Feedback</span>
      </Button>

      <Modal {...feedbackModalProps} title={title}>
        {type ? (
          <feedbackFetcher.Form action={actionUrl}>
            <div className="space-y-2 p-4">
              <FormField
                required
                autoFocus
                defaultValue={(feedbackFetcher.formData?.get("message") as string) || ""}
                name="message"
                input={<Textarea rows={5} />}
                errors={!feedbackFetcher.data?.success && feedbackFetcher.data?.fieldErrors?.message}
              />
              <input type="hidden" name="type" value={type} />
              <FormActionInput value={FeedbackMethods.CreateFeedback} />
              <FormError error={!feedbackFetcher.data?.success && feedbackFetcher.data?.formError} />
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setType(null)}>
                  Change type
                </Button>
                <FormButton isLoading={feedbackFetcher.state !== "idle"}>Send</FormButton>
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
      </Modal>
    </>
  )
}
