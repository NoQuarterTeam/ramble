import type { ActionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import type { LoaderArgs } from "@vercel/remix"
import { json, redirect } from "@vercel/remix"
import * as React from "react"
import { z } from "zod"
import { zx } from "zodix"

import { userInterestFields } from "@ramble/shared"

import { Form, FormButton, FormError } from "~/components/Form"
import { LinkButton } from "~/components/LinkButton"
import { Button } from "~/components/ui"
import { db } from "~/lib/db.server"
import { formError, validateFormData } from "~/lib/form"
import type { RambleIcon } from "~/lib/interests"
import { interestOptions } from "~/lib/interests"
import { getCurrentUser, requireUser } from "~/services/auth/auth.server"

import { Footer } from "./components/Footer"

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getCurrentUser(request, userInterestFields)
  return json(user)
}

const schema = z.object({
  isSurfer: zx.BoolAsString,
  isClimber: zx.BoolAsString,
  isMountainBiker: zx.BoolAsString,
  isPaddleBoarder: zx.BoolAsString,
  isHiker: zx.BoolAsString,
})

export const action = async ({ request }: ActionArgs) => {
  const result = await validateFormData(request, schema)
  if (!result.success) return formError(result)
  const id = await requireUser(request)
  await db.user.update({ where: { id }, data: result.data })
  return redirect("/onboarding/3")
}

export default function Onboarding2() {
  const user = useLoaderData<typeof loader>()

  return (
    <Form className="space-y-10">
      <div>
        <h1 className="text-3xl">What are you into?</h1>
        <p className="opacity-70">Some things that may interest you</p>
      </div>
      <div className="flex w-full flex-wrap items-center justify-center gap-2 md:gap-4">
        {interestOptions
          .filter((i) => i.value !== "isPetOwner")
          .map((interest) => (
            <InterestSelector
              key={interest.value}
              Icon={interest.Icon}
              label={interest.label}
              field={interest.value}
              defaultValue={user[interest.value as keyof typeof user]}
            />
          ))}
      </div>
      <FormError />
      <Footer>
        <LinkButton size="lg" to=".." variant="ghost">
          Back
        </LinkButton>

        <FormButton size="lg">Next</FormButton>
      </Footer>
    </Form>
  )
}

function InterestSelector({
  label,
  field,
  defaultValue,
  Icon,
}: {
  label: string
  field: string
  Icon: RambleIcon
  defaultValue: boolean
}) {
  const [isSelected, setIsSelected] = React.useState(defaultValue)
  return (
    <>
      <Button
        variant={isSelected ? "primary" : "outline"}
        type="button"
        size="lg"
        className="py-8"
        leftIcon={<Icon className="sq-4" />}
        onClick={() => setIsSelected((s) => !s)}
      >
        {label}
      </Button>
      <input type="hidden" name={field} value={String(isSelected)} />
    </>
  )
}
