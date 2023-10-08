import * as React from "react"
import { useLoaderData } from "@remix-run/react"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@vercel/remix"
import { json, redirect } from "@vercel/remix"
import { Dog, FishOff } from "lucide-react"
import { z } from "zod"
import { zx } from "zodix"

import { Form, FormButton, FormError } from "~/components/Form"
import { LinkButton } from "~/components/LinkButton"
import { Button } from "~/components/ui"
import { db } from "~/lib/db.server"
import { formError, useFormErrors, validateFormData } from "~/lib/form"
import { getCurrentUser, requireUser } from "~/services/auth/auth.server"

import { Footer } from "./components/Footer"
import { track } from "@vercel/analytics/server"

export const config = {
  // runtime: "edge",
  // regions: ["fra1", "cdg1", "dub1", "arn1", "lhr1"],
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getCurrentUser(request, { isPetOwner: true })
  return json(user)
}

const schema = z.object({
  isPetOwner: zx.BoolAsString,
})

export const action = async ({ request }: ActionFunctionArgs) => {
  const result = await validateFormData(request, schema)
  if (!result.success) return formError(result)
  const id = await requireUser(request)
  const user = await db.user.update({ where: { id }, data: { isPetOwner: result.data.isPetOwner } })
  track("Onboarding 3 submitted", { userId: user.id })
  return redirect("/onboarding/4")
}

export default function Onboarding3() {
  const user = useLoaderData<typeof loader>()
  const [isPetOwner, setIsPetOwner] = React.useState<boolean | null>(user.isPetOwner || null)
  const actionData = useFormErrors<typeof schema>()
  return (
    <Form className="space-y-10">
      <div>
        <h1 className="text-3xl">Have any pets that you take on the road?</h1>
        <p className="opacity-70">There&apos;s no wrong answer</p>
        <input type="hidden" name="isPetOwner" value={String(isPetOwner)} />
      </div>
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="flex space-x-10">
          <Button
            type="button"
            onClick={() => setIsPetOwner(false)}
            className="py-8"
            leftIcon={<FishOff className="sq-6" />}
            variant={!isPetOwner ? "primary" : "outline"}
          >
            No, I&apos;m lonely
          </Button>
          <Button
            type="button"
            onClick={() => setIsPetOwner(true)}
            className="py-8"
            variant={isPetOwner ? "primary" : "outline"}
            leftIcon={<Dog className="sq-6" />}
          >
            Yes, I&apos;m happy
          </Button>
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
