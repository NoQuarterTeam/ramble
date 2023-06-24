"use client"
import * as React from "react"
import * as ModalPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { join, merge, type UseDisclosure } from "@ramble/shared"

const ModalRoot = ModalPrimitive.Root

const ModalTrigger = ModalPrimitive.Trigger

function ModalPortal({ className, children, ...props }: ModalPrimitive.DialogPortalProps) {
  return (
    <ModalPrimitive.Portal className={merge(className)} {...props}>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:items-center sm:pt-0">{children}</div>
    </ModalPrimitive.Portal>
  )
}
ModalPortal.displayName = ModalPrimitive.Portal.displayName

const ModalOverlay = React.forwardRef<
  React.ElementRef<typeof ModalPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof ModalPrimitive.Overlay>
>(({ className, children, ...props }, ref) => (
  <ModalPrimitive.Overlay
    className={merge(
      "data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-all duration-100",
      className,
    )}
    {...props}
    ref={ref}
  />
))
ModalOverlay.displayName = ModalPrimitive.Overlay.displayName

const ModalContent = React.forwardRef<
  React.ElementRef<typeof ModalPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ModalPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <ModalPortal>
    <ModalOverlay />
    <ModalPrimitive.Content
      ref={ref}
      className={merge(
        "animate-in data-[state=open]:fade-in-90 data-[state=open]:slide-in-from-bottom-10 sm:zoom-in-90 data-[state=open]:sm:slide-in-from-bottom-0 fixed z-50 grid w-full gap-4 rounded-lg bg-white p-6",
        "dark:bg-gray-900",
        className,
      )}
      {...props}
    >
      {children}
      <ModalPrimitive.Close className="absolute right-4 top-4 rounded-md opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none">
        <X className="sq-4" />
        <span className="sr-only">Close</span>
      </ModalPrimitive.Close>
    </ModalPrimitive.Content>
  </ModalPortal>
))
ModalContent.displayName = ModalPrimitive.Content.displayName

function ModalHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={merge("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
}
ModalHeader.displayName = "ModalHeader"

function ModalFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={merge("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
}
ModalFooter.displayName = "ModalFooter"

const ModalTitle = React.forwardRef<
  React.ElementRef<typeof ModalPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ModalPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ModalPrimitive.Title
    ref={ref}
    className={merge("text-lg font-semibold text-gray-900", "dark:text-gray-50", className)}
    {...props}
  />
))
ModalTitle.displayName = ModalPrimitive.Title.displayName

const ModalDescription = React.forwardRef<
  React.ElementRef<typeof ModalPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ModalPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ModalPrimitive.Description ref={ref} className={merge("text-sm text-gray-500", "dark:text-gray-400", className)} {...props} />
))
ModalDescription.displayName = ModalPrimitive.Description.displayName

export { ModalRoot, ModalTrigger, ModalContent, ModalHeader, ModalFooter, ModalTitle, ModalDescription }

export interface ModalProps extends Partial<UseDisclosure> {
  title?: string
  description?: string
  children?: React.ReactNode
  trigger?: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full"
}

export function Modal({ size = "md", description, trigger, children, title, ...disclosureProps }: ModalProps) {
  return (
    <ModalRoot
      modal
      open={disclosureProps.isOpen}
      onOpenChange={(open) => (open ? disclosureProps.onClose?.() : disclosureProps.onClose?.())}
    >
      {trigger && <ModalTrigger asChild>{trigger}</ModalTrigger>}
      <ModalContent
        className={join(
          size === "sm" && "max-w-sm",
          size === "md" && "max-w-md",
          size === "lg" && "max-w-lg",
          size === "xl" && "max-w-xl",
          size === "2xl" && "max-w-2xl",
          size === "3xl" && "max-w-3xl",
          size === "full" && "max-w-full",
        )}
      >
        <ModalHeader>
          {title && <ModalTitle>{title}</ModalTitle>}
          {description && <ModalDescription>{description}</ModalDescription>}
        </ModalHeader>
        {children}
      </ModalContent>
    </ModalRoot>
  )
}
