import type { List } from "@ramble/database/types"
import { Textarea } from "@ramble/ui"
import { Form, FormButton, FormError, FormField } from "~/components/Form"
import { LinkButton } from "~/components/LinkButton"

interface Props {
  list?: Pick<List, "id" | "name" | "description">
}

export function ListForm(props: Props) {
  return (
    <Form className="mx-auto max-w-lg space-y-2">
      <h3 className="text-2xl">{props.list ? "Update list" : "New list"}</h3>
      <FormField defaultValue={props.list?.name || ""} autoFocus label="Name" name="name" />
      <FormField
        defaultValue={props.list?.description || ""}
        label="Description"
        name="description"
        input={<Textarea rows={3} />}
      />
      <FormError />
      <div className="flex space-x-1">
        <FormButton>{props.list ? "Update" : "Create"}</FormButton>
        <LinkButton
          variant="ghost"
          // @ts-expect-error remix to accepts a number
          to={-1}
        >
          Cancel
        </LinkButton>
      </div>
    </Form>
  )
}
