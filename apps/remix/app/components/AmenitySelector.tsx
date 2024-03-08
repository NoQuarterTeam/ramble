import * as React from "react"

import type { spotAmenitiesSchema } from "@ramble/server-schemas"

import { useFormErrors } from "~/lib/form"

import { FormFieldError } from "./Form"
import { Button, type RambleIcon } from "./ui"

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
      {errors && (
        <ul id="type-error">
          {errors?.map((error) => (
            <FormFieldError key={error}>{error}</FormFieldError>
          ))}
        </ul>
      )}
      <input type="hidden" name={value} value={String(isSelected)} />
    </div>
  )
}
