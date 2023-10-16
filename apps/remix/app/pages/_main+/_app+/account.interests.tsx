import React from "react"
import { useLoaderData } from "@remix-run/react"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { z } from "zod"
import { zx } from "zodix"

import { userInterestFields } from "@ramble/shared"

import { Form, FormButton, FormError } from "~/components/Form"
import type { RambleIcon } from "~/components/ui"
import { Button } from "~/components/ui"
import { track } from "~/lib/analytics.server"
import { db } from "~/lib/db.server"
import { formError, validateFormData } from "~/lib/form.server"
import { interestOptions } from "~/lib/models/user"
import { redirect } from "~/lib/remix.server"
import { getCurrentUser } from "~/services/auth/auth.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getCurrentUser(request, userInterestFields)
  return json(user)
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getCurrentUser(request, { id: true, van: { select: { id: true } } })
  const schema = z.object({
    isSurfer: zx.BoolAsString,
    isClimber: zx.BoolAsString,
    isPetOwner: zx.BoolAsString,
    isMountainBiker: zx.BoolAsString,
    isPaddleBoarder: zx.BoolAsString,
    isHiker: zx.BoolAsString,
  })
  const result = await validateFormData(request, schema)
  if (!result.success) return formError(result)

  await db.user.update({ where: { id: user.id }, data: result.data })
  track("Interests updated", { userId: user.id })
  return redirect("/account/interests", request, { flash: { title: "Account updated" } })
}

export default function Interests() {
  const user = useLoaderData<typeof loader>()

  return (
    <Form className="space-y-4">
      <h1 className="text-3xl">Interests</h1>

      <div className="flex w-full flex-wrap gap-2 py-10 md:gap-4">
        {interestOptions.map((interest) => (
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
      <FormButton>Save</FormButton>
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
        leftIcon={<Icon className="sq-4" />}
        onClick={() => setIsSelected((s) => !s)}
      >
        {label}
      </Button>
      <input type="hidden" name={field} value={String(isSelected)} />
    </>
  )
}
