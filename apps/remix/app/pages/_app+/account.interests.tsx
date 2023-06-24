import React from "react"
import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import type { LucideProps } from "lucide-react"
import { z } from "zod"
import { zx } from "zodix"

import { userInterestFields } from "@ramble/shared"

import { Form, FormButton, FormError } from "~/components/Form"
import { Button } from "~/components/ui"
import { db } from "~/lib/db.server"
import { formError, validateFormData } from "~/lib/form"
import { interestOptions } from "~/lib/interests"
import { redirect } from "~/lib/remix.server"
import { getCurrentUser } from "~/services/auth/auth.server"

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getCurrentUser(request, userInterestFields)
  return json(user)
}

export const action = async ({ request }: ActionArgs) => {
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
  Icon: (props: LucideProps) => JSX.Element
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
