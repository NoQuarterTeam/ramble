import type { SerializeFrom } from "@remix-run/node"
import type { Fetcher, FetcherWithComponents, FormProps as RemixFormProps } from "@remix-run/react"
import { Form as RemixForm, useFetchers, useNavigation, useFetcher as useRemixFetcher } from "@remix-run/react"
import { X } from "lucide-react"
import * as React from "react"
import { AuthenticityTokenInput } from "remix-utils/csrf/react"
import type { z } from "zod"

import { createImageUrl, merge } from "@ramble/shared"

import type { ButtonProps, InputProps, InputStyleProps } from "~/components/ui"
import { Button, IconButton, Input, inputStyles } from "~/components/ui"
import { FORM_ACTION, useFormErrors } from "~/lib/form"
import type { ActionDataErrorResponse } from "~/lib/form.server"

import { ImageUploader } from "./ImageUploader"
// import { ActionDataErrorResponse } from "~/lib/form.server"

export const Form = React.forwardRef(function _Form(props: RemixFormProps, ref: React.ForwardedRef<HTMLFormElement> | null) {
  const form = useFormErrors()
  return (
    <RemixForm
      method="POST"
      replace
      aria-describedby="form-error"
      aria-invalid={form?.formError ? true : undefined}
      ref={ref}
      navigate={props.navigate || props.fetcherKey ? false : undefined}
      {...props}
    >
      {props.children}
      <AuthenticityTokenInput />
    </RemixForm>
  )
})

export function useFetcher<T>(
  props?: Parameters<typeof useRemixFetcher>[0] & {
    onFinish?: (data: T) => void
  },
): FetcherWithComponents<SerializeFrom<T>> & {
  FormButton: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>
} {
  const fetcher = useRemixFetcher<T>({ key: props?.key })

  function Form({ children, ...rest }: RemixFormProps) {
    return (
      <fetcher.Form method="POST" replace {...rest}>
        {children}
        <AuthenticityTokenInput />
      </fetcher.Form>
    )
  }

  const FormButton = React.forwardRef<HTMLButtonElement, ButtonProps>(function _FormButton(rest, ref) {
    return (
      <Button
        type="submit"
        name={rest.value ? FORM_ACTION : undefined}
        isLoading={
          rest.value ? fetcher.state !== "idle" && fetcher.formData?.get(FORM_ACTION) === rest.value : fetcher.state !== "idle"
        }
        {...rest}
        ref={ref}
      />
    )
  })

  React.useEffect(() => {
    if (!fetcher.data || !props?.onFinish) return
    if (fetcher.state !== "idle" && fetcher.data) {
      props.onFinish(fetcher.data as T)
    }
  }, [fetcher.state, props, fetcher.data])

  // @ts-expect-error - this is fine
  return { ...fetcher, Form, FormButton }
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
  fetcherKey?: string
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(function FormField(
  { label, errors, input, fetcherKey, ...props },
  ref,
) {
  const form = useFormErrors<z.AnyZodObject>()
  const fetchers = useFetchers()
  const fetcher: Fetcher<ActionDataErrorResponse<z.AnyZodObject>> | undefined = fetcherKey
    ? fetchers.find((f) => f.key === fetcherKey)
    : undefined
  const fieldErrors = errors || fetcher?.data?.fieldErrors?.[props.name] || form?.fieldErrors?.[props.name]
  const inputClassName = input?.props.className
  const className = merge(props.className, inputClassName, fieldErrors && "border-red-500 focus:border-red-500")

  const sharedProps = {
    "aria-invalid": fieldErrors || fieldErrors?.length ? true : undefined,
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

      {typeof fieldErrors === "string" ? (
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
          dropzoneOptions={{
            maxFiles: 1,
            accept: {
              "image/*": [".jpg", ".jpeg", ".png", ".gif", ".avif", ".webp", ".heic"],
            },
          }}
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
            className="absolute top-1 right-1"
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
        <ul id={`${props.name}-error`}>
          {fieldErrors?.map((error) => (
            <FormFieldError key={error}>{error}</FormFieldError>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export function FormError({ error, fetcherKey }: { error?: string | null | false; fetcherKey?: string }) {
  const form = useFormErrors<z.AnyZodObject>()
  const fetchers = useFetchers()
  const fetcher: Fetcher<ActionDataErrorResponse<z.AnyZodObject>> | undefined = fetcherKey
    ? fetchers.find((f) => f.key === fetcherKey)
    : undefined
  const formError = error || fetcher?.data?.formError || form?.formError
  if (!formError) return null
  return <FormFieldError id="form-error">{formError}</FormFieldError>
}
export const FormButton = React.forwardRef<HTMLButtonElement, ButtonProps>(function _FormButton(props, ref) {
  const navigation = useNavigation()
  const isFormActionLoading =
    navigation.state !== "idle" &&
    !!navigation.formData?.get(FORM_ACTION) &&
    !!props.value &&
    navigation.formData.get(FORM_ACTION) === props.value

  return (
    <Button
      type="submit"
      name={props.value ? FORM_ACTION : undefined}
      isLoading={props.value ? isFormActionLoading : navigation.state !== "idle" && !!navigation.formAction}
      {...props}
      ref={ref}
    />
  )
})
