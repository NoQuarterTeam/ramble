import * as React from "react"
import { type SerializeFrom } from "@remix-run/node"
import type { FetcherWithComponents, FormProps as RemixFormProps } from "@remix-run/react"
import { Form as RemixForm, useFetcher as useRemixFetcher, useNavigation } from "@remix-run/react"
import { X } from "lucide-react"
import { AuthenticityTokenInput } from "remix-utils/csrf/react"
import { type z } from "zod"

import { createImageUrl, merge } from "@ramble/shared"

import { type ButtonProps, type InputProps, type InputStyleProps } from "~/components/ui"
import { Button, IconButton, Input, inputStyles } from "~/components/ui"
import { useFormErrors } from "~/lib/form"

import { ImageUploader } from "./ImageUploader"

export const Form = React.forwardRef(function _Form(props: RemixFormProps, ref: React.ForwardedRef<HTMLFormElement> | null) {
  const form = useFormErrors()
  return (
    <RemixForm
      method="POST"
      replace
      aria-describedby="form-error"
      aria-invalid={form?.formError ? true : undefined}
      ref={ref}
      {...props}
    >
      <AuthenticityTokenInput />
      {props.children}
    </RemixForm>
  )
})

interface UseFetcherProps<T> {
  onFinish?: (data: T) => void
}

export function useFetcher<T>(props?: UseFetcherProps<T>): FetcherWithComponents<SerializeFrom<T>> {
  const fetcher = useRemixFetcher()

  function Form({ children, ...rest }: RemixFormProps) {
    return (
      <fetcher.Form method="POST" replace {...rest}>
        <AuthenticityTokenInput />
        {children}
      </fetcher.Form>
    )
  }

  React.useEffect(() => {
    if (!fetcher.data || !props) return
    if (fetcher.state === "loading" && fetcher.data) {
      props.onFinish?.(fetcher.data)
    }
  }, [fetcher.state, props, fetcher.data])

  // @ts-expect-error - this is fine
  return { ...fetcher, Form }
}

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
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(function FormField(
  { label, errors, input, ...props },
  ref,
) {
  const form = useFormErrors<z.AnyZodObject>()
  const fieldErrors = errors || form?.fieldErrors?.[props.name]
  const inputClassName = input?.props.className
  const className = merge(props.className, inputClassName, fieldErrors && "border-red-500 focus:border-red-500")

  const sharedProps = {
    "aria-invalid": fieldErrors || fieldErrors?.length ? true : undefined,
    "aria-errormessage": props.name + "-error",
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
      {clonedInput || <Input size="sm" {...sharedProps} />}

      {typeof fieldErrors === "string" ? (
        <FormFieldError>{fieldErrors}</FormFieldError>
      ) : fieldErrors?.length ? (
        <ul id={props.name + "-error"}>{fieldErrors?.map((error, i) => <FormFieldError key={i}>{error}</FormFieldError>)}</ul>
      ) : null}
    </div>
  )
})
export const InlineFormField = React.forwardRef<HTMLInputElement, FormFieldProps>(function FormField(
  { label, errors, input, shouldPassProps = true, ...props },
  ref,
) {
  const form = useFormErrors<z.AnyZodObject>()
  const fieldErrors = errors || form?.fieldErrors?.[props.name]
  const className = merge(props.className, fieldErrors && "border-red-500 focus:border-red-500")
  const sharedProps = shouldPassProps
    ? {
        "aria-invalid": fieldErrors || fieldErrors?.length ? true : undefined,
        "aria-errormessage": props.name + "-error",
        id: props.name,
        ref,
        defaultValue: form?.data?.[props.name],
        ...props,
        name: props.name,
        className,
      }
    : {}
  const clonedInput = input && React.cloneElement(input, sharedProps)
  return (
    <div className="w-full">
      <div className="flex flex-col space-x-0 md:flex-row md:space-x-3">
        {label && (
          <div className="w-min-content">
            <FormFieldLabel name={props.name} required={props.required} className="w-24">
              {label}
            </FormFieldLabel>
          </div>
        )}
        {clonedInput || <Input size="sm" {...sharedProps} />}
      </div>
      {typeof fieldErrors === "string" ? (
        <FormFieldError>{fieldErrors}</FormFieldError>
      ) : fieldErrors?.length ? (
        <ul id={props.name + "-error"}>{fieldErrors?.map((error, i) => <FormFieldError key={i}>{error}</FormFieldError>)}</ul>
      ) : null}
    </div>
  )
})

interface ImageFieldProps {
  className?: string
  name: string
  label?: string
  errors?: string | string[] | null
  defaultValue?: string | null | undefined
  required?: boolean
  placeholder?: string
  variant?: InputStyleProps["variant"]
  children?: React.ReactNode
  onRemove?: () => void
}

export function ImageField(props: ImageFieldProps) {
  const form = useFormErrors<z.AnyZodObject>()
  const [image, setImage] = React.useState(props.defaultValue)
  const fieldErrors = props.errors || form?.fieldErrors?.[props.name]
  const hasChildren = React.Children.count(props.children) > 0

  return (
    <div>
      {props.label && (
        <FormFieldLabel name={props.name} required={props.required}>
          {props.label}
        </FormFieldLabel>
      )}
      <div className="relative">
        <ImageUploader
          onSubmit={setImage}
          className={
            hasChildren
              ? ""
              : props.className ||
                merge(
                  inputStyles({ variant: props.variant || "outline" }),
                  "h-48 w-full cursor-pointer object-cover hover:opacity-80",
                )
          }
        >
          {image ? (
            <img src={createImageUrl(image)} className="h-full w-full object-cover" alt="preview" />
          ) : hasChildren ? (
            props.children
          ) : (
            <div className="center h-full w-full">
              <p className="text-center text-gray-500">{props.placeholder || "Upload an image"}</p>
            </div>
          )}
        </ImageUploader>
        {props.onRemove && image && (
          <IconButton
            variant="secondary"
            size="xs"
            className="absolute right-1 top-1"
            aria-label="remove image"
            icon={<X className="sq-3" />}
            onClick={props.onRemove}
          />
        )}
        <input type="hidden" value={image || ""} name={props.name} />
      </div>
      {typeof fieldErrors === "string" ? (
        <FormFieldError>{fieldErrors}</FormFieldError>
      ) : fieldErrors?.length ? (
        <ul id={props.name + "-error"}>{fieldErrors?.map((error, i) => <FormFieldError key={i}>{error}</FormFieldError>)}</ul>
      ) : null}
    </div>
  )
}

export function FormError({ error }: { error?: string | null | false }) {
  const form = useFormErrors<z.AnyZodObject>()
  if (!form?.formError && !error) return null
  return <FormFieldError id="form-error">{form?.formError || error}</FormFieldError>
}
export const FormButton = React.forwardRef<HTMLButtonElement, ButtonProps>(function _FormButton(props, ref) {
  const navigation = useNavigation()
  return <Button type="submit" isLoading={navigation.state !== "idle" && !!navigation.formAction} {...props} ref={ref} />
})
