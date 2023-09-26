import TextareaAutosize, { TextareaAutosizeProps } from "react-textarea-autosize"
import { ClientOnly } from "remix-utils"

export function TextareaResize(props: TextareaAutosizeProps) {
  return <ClientOnly>{() => <TextareaAutosize {...props} />}</ClientOnly>
}
