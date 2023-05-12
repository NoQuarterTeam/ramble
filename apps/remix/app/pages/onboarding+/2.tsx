import * as React from "react"
import type { ActionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import type { LoaderArgs } from "@vercel/remix"
import { json, redirect } from "@vercel/remix"
import { Bike, Footprints, Mountain, Waves } from "lucide-react"
import { z } from "zod"
import { zx } from "zodix"

import { join } from "@ramble/shared"

import { Form, FormButton, FormError } from "~/components/Form"
import { LinkButton } from "~/components/LinkButton"
import { db } from "~/lib/db.server"
import { formError, validateFormData } from "~/lib/form"
import { getCurrentUser, requireUser } from "~/services/auth/auth.server"

import Footer from "./components/Footer"

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getCurrentUser(request, { isClimber: true, isHiker: true, isMountainBiker: true, isPaddleBoarder: true })
  return json(user)
}

const schema = z.object({
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
  const [isClimber, setIsClimber] = React.useState(user.isClimber)
  const [isMountainBiker, setIsMountainBiker] = React.useState(user.isMountainBiker)
  const [isPaddleBoarder, setIsPaddleBoarder] = React.useState(user.isPaddleBoarder)
  const [isHiker, setIsHiker] = React.useState(user.isHiker)
  return (
    <Form method="post" replace className="space-y-10">
      <div>
        <h1 className="text-3xl">What sports are you into?</h1>
        <p className="opacity-70">Are you fat, basically</p>
      </div>
      <input type="hidden" name="isClimber" value={String(isClimber)} />
      <input type="hidden" name="isMountainBiker" value={String(isMountainBiker)} />
      <input type="hidden" name="isPaddleBoarder" value={String(isPaddleBoarder)} />
      <input type="hidden" name="isHiker" value={String(isHiker)} />
      <div className="flex w-full flex-wrap items-center justify-center gap-2 md:gap-4">
        <button
          type="button"
          onClick={() => setIsClimber((s) => !s)}
          className={join(
            "sq-32 md:sq-48 hover:bg-gray-75 flex flex-col items-center justify-center space-y-4 rounded border border-gray-100 dark:border-gray-700 dark:hover:bg-gray-700",
            isClimber === true &&
              "border-primary-400 dark:border-primary-700 bg-primary-500 dark:bg-primary-700 hover:bg-primary-600 dark:hover:bg-primary-800",
          )}
        >
          <Mountain className="sq-6 md:sq-10" />
          <span className="md:text-md text-sm">Climbing</span>
        </button>
        <button
          type="button"
          onClick={() => setIsMountainBiker((s) => !s)}
          className={join(
            "sq-32 md:sq-48 hover:bg-gray-75 flex flex-col items-center justify-center space-y-4 rounded border border-gray-100 dark:border-gray-700 dark:hover:bg-gray-700",
            isMountainBiker === true &&
              "border-primary-400 dark:border-primary-700 bg-primary-500 dark:bg-primary-700 hover:bg-primary-600 dark:hover:bg-primary-800",
          )}
        >
          <Bike className="sq-6 md:sq-10" />
          <span className="md:text-md text-sm">Mountain biking</span>
        </button>
        <button
          type="button"
          onClick={() => setIsPaddleBoarder((s) => !s)}
          className={join(
            "sq-32 md:sq-48 hover:bg-gray-75 flex flex-col items-center justify-center space-y-4 rounded border border-gray-100 dark:border-gray-700 dark:hover:bg-gray-700",
            isPaddleBoarder === true &&
              "border-primary-400 dark:border-primary-700 bg-primary-500 dark:bg-primary-700 hover:bg-primary-600 dark:hover:bg-primary-800",
          )}
        >
          <Waves className="sq-6 md:sq-10" />
          <span className="md:text-md text-sm">Paddle Boarding</span>
        </button>
        <button
          type="button"
          onClick={() => setIsHiker((s) => !s)}
          className={join(
            "sq-32 md:sq-48 hover:bg-gray-75 flex flex-col items-center justify-center space-y-4 rounded border border-gray-100 dark:border-gray-700 dark:hover:bg-gray-700",
            isHiker === true &&
              "border-primary-400 dark:border-primary-700 bg-primary-500 dark:bg-primary-700 hover:bg-primary-600 dark:hover:bg-primary-800",
          )}
        >
          <Footprints className="sq-6 md:sq-10" />
          <span className="md:text-md text-sm">Hiking</span>
        </button>
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
