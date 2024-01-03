import * as React from "react"
import { useFormErrors } from "~/lib/form"
import { Button, RambleIcon } from "./ui"
import { spotAmenitiesSchema } from "@ramble/server-schemas"
import { FormFieldError } from "./Form"

export function AmenitySelector({
  label,
  defaultIsSelected,
  value,
  Icon,
}: {
  label: string
  defaultIsSelected: boolean
  value: string
  Icon: RambleIcon | null
}) {
  const form = useFormErrors<typeof spotAmenitiesSchema>()
  const errors = form?.fieldErrors?.[value as keyof typeof form.fieldErrors]
  const [isSelected, setIsSelected] = React.useState(defaultIsSelected)
  return (
    <div>
      <Button
        leftIcon={Icon && <Icon size={20} />}
        variant={isSelected ? "primary" : "outline"}
        type="button"
        size="md"
        onClick={() => setIsSelected(!isSelected)}
      >
        {label}
      </Button>
      {errors && <ul id="type-error">{errors?.map((error, i) => <FormFieldError key={i}>{error}</FormFieldError>)}</ul>}
      <input type="hidden" name={value} value={String(isSelected)} />
    </div>
  )
}
