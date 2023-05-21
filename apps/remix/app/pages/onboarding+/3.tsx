import * as React from "react"
import type { ActionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import type { LoaderArgs } from "@vercel/remix"
import { json, redirect } from "@vercel/remix"
import { Dog, FishOff } from "lucide-react"
import { z } from "zod"
import { zx } from "zodix"

import { join } from "@ramble/shared"

import { Form, FormButton, FormError } from "~/components/Form"
import { LinkButton } from "~/components/LinkButton"
import { db } from "~/lib/db.server"
import { formError, useFormErrors, validateFormData } from "~/lib/form"
import { getCurrentUser, requireUser } from "~/services/auth/auth.server"

import Footer from "./components/Footer"

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getCurrentUser(request, { isPetOwner: true })
  return json(user)
}

const schema = z.object({
  isPetOwner: zx.BoolAsString,
})

export const action = async ({ request }: ActionArgs) => {
  const result = await validateFormData(request, schema)
  if (!result.success) return formError(result)
  const id = await requireUser(request)
  await db.user.update({ where: { id }, data: { isPetOwner: result.data.isPetOwner } })
  return redirect("/onboarding/4")
}

export default function Onboarding() {
  const user = useLoaderData<typeof loader>()
  const [isPetOwner, setIsPetOwner] = React.useState<boolean | null>(user.isPetOwner || null)
  const actionData = useFormErrors<typeof schema>()
  return (
    <Form method="post" replace className="space-y-10">
      <div>
        <h1 className="text-3xl">Have any pets that you take on the road?</h1>
        <p className="opacity-70">There&apos;s no wrong answer</p>
        <input type="hidden" name="isPetOwner" value={String(isPetOwner)} />
      </div>
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="flex space-x-10">
          <button
            type="button"
            onClick={() => setIsPetOwner(false)}
            className={join(
              "sq-48 flex flex-col items-center justify-center space-y-4 rounded-md border border-gray-100 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700",
              isPetOwner === false &&
                "border-primary-400 dark:border-primary-700 bg-primary-500 dark:bg-primary-700 hover:bg-primary-600 dark:hover:bg-primary-800",
            )}
          >
            <FishOff className="sq-10" />
            <span>No, I&apos;m lonely</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPetOwner(true)}
            className={join(
              "sq-48 flex flex-col items-center justify-center space-y-4 rounded-md border border-gray-100 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700",
              isPetOwner === true &&
                "border-primary-400 dark:border-primary-700 bg-primary-500 dark:bg-primary-700 hover:bg-primary-600 dark:hover:bg-primary-800",
            )}
          >
            <Dog className="sq-10" />
            <span>Yes, I&apos;m happy</span>
          </button>
        </div>
        {actionData?.fieldErrors?.isPetOwner && <p className="w-full text-center">Please choose an answer</p>}
        <FormError />
      </div>
      <Footer>
        <LinkButton size="lg" to="../2" variant="ghost">
          Back
        </LinkButton>
        <FormButton size="lg">Next</FormButton>
      </Footer>
    </Form>
  )
}
