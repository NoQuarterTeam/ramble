import * as React from "react"

import { merge } from "@ramble/shared"

import type { InputProps } from "@/components/ui"
import { Input } from "@/components/ui"

export function FormFieldLabel(
  props: React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement> & {
    name?: string
    required?: boolean
    className?: string
  },
) {
  return (
    <label
      htmlFor={props.name}
      {...props}
      className={merge("flex font-normal text-gray-700 dark:text-gray-100", props.className)}
    >
      {props.children}
      {props.required && <span className="pl-0.5 text-red-500">*</span>}
    </label>
  )
}
export function FormFieldError(
  props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement> & {
    className?: string
  },
) {
  return (
    <p {...props} className={merge("text-red-400", props.className)}>
      {props.children}
    </p>
  )
}

interface FormFieldProps extends InputProps {
  name: string
  label?: string
  input?: React.ReactElement
  errors?: string | string[] | null | false
  shouldPassProps?: boolean
  fetcherKey?: string
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(function FormField(
  { label, errors, input, fetcherKey, ...props },
  ref,
) {
  const fieldErrors = errors
  const inputClassName = input?.props.className
  const className = merge(props.className, inputClassName, fieldErrors && "border-red-500 focus:border-red-500")

  const sharedProps = {
    "aria-errormessage": `${props.name}-error`,
    id: props.name,
    ...props,
    ref,
    name: props.name,
    className,
  }

  const clonedInput = input && React.cloneElement(input, sharedProps)
  return (
    <div>
      {label && (
        <FormFieldLabel name={props.name} required={props.required}>
          {label}
        </FormFieldLabel>
      )}
      {clonedInput || <Input {...sharedProps} />}

      {!fieldErrors ? null : typeof fieldErrors === "string" ? (
        <FormFieldError>{fieldErrors}</FormFieldError>
      ) : fieldErrors?.length ? (
        <ul id={`${props.name}-error`}>
          {fieldErrors?.map((err) => (
            <FormFieldError key={err}>{err}</FormFieldError>
          ))}
        </ul>
      ) : null}
    </div>
  )
})

export function FormError({ error }: { error?: string | null | false }) {
  const formError = error
  if (!formError) return null
  return <FormFieldError id="form-error">{formError}</FormFieldError>
}
