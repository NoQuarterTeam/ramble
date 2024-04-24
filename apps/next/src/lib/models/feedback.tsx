import type { LucideIcon, LucideProps } from "lucide-react"
import { Bug, Lightbulb, MessageCircle } from "lucide-react"

import type { FeedbackType } from "@ramble/database/types"

import type { RambleIcon } from "@/components/ui"

export const FEEDBACKS: { [key in FeedbackType]: { label: string; Icon: RambleIcon } } = {
  ISSUE: { label: "Issue", Icon: Bug },
  IDEA: { label: "Idea", Icon: Lightbulb },
  OTHER: { label: "Other", Icon: MessageCircle },
} as const

export const FEEDBACK_OPTIONS = Object.entries(FEEDBACKS).map(([value, { label, Icon }]) => ({ label, value, Icon })) as {
  label: string
  value: FeedbackType
  Icon: LucideIcon
}[]

export function FeedbackIcon({ type, ...props }: { type: FeedbackType } & LucideProps) {
  const { Icon } = FEEDBACKS[type]
  return <Icon {...props} />
}
