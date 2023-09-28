import { type LoaderArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { z } from "zod"

import { join, merge } from "@ramble/shared"

import { useFetcher } from "~/components/Form"
import { db } from "~/lib/db.server"
import { formError, validateFormData } from "~/lib/form"
import { useLoaderHeaders } from "~/lib/headers.server"
import { Link } from "@remix-run/react"

export const config = {
  // runtime: "edge",
}

export const headers = useLoaderHeaders

export const action = async ({ request }: LoaderArgs) => {
  const schema = z.object({ email: z.string().email() })
  const result = await validateFormData(request, schema)
  if (!result.success) return formError(result)
  const accessRequest = await db.accessRequest.findFirst({ where: { email: result.data.email } })
  if (accessRequest) return formError({ formError: "Email already requested access" })
  await db.accessRequest.create({ data: { email: result.data.email } })
  return json({ success: true })
}

export default function Home() {
  return (
    <div className="bg-background dark pb-20 font-serif text-white">
      <div className="absolute right-6 top-16 md:top-6">
        <Link
          to="/login"
          className="border-xs rounded-xs whitespace-nowrap bg-black px-4 py-2 text-center text-white hover:opacity-80 disabled:opacity-70"
        >
          Login
        </Link>
      </div>
      <div className="h-[90vh] w-screen space-y-20 bg-[url('/landing/landing1.png')] px-4 pt-10 md:pt-28">
        <div className="mx-auto flex max-w-6xl flex-col items-start space-y-12">
          <div className="flex flex-col items-center">
            <p className="brand-header text-5xl">ramble</p>
            <p className="text-lg font-semibold text-black">VAN TRAVEL APP</p>
          </div>
          <div>
            <h1 className="text-3xl text-black">Everything you need for remote working van life in Europe.</h1>
            <h2 className="text-xl text-black">For the outdoor enthusiasts who seek adventure, authenticity and community.</h2>
          </div>

          <RequestAccessForm />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-20 md:py-32">
        <p className="text-xl">
          Built for a new generation of{" "}
          <span className="text-primary font-semibold">remote working, digitally connected travelers</span> looking for{" "}
          <span className="text-primary font-semibold">authentic</span> nature, genuine connection and a more sustainable way to
          travel.
          <br />
          <br />
          Inspired by the great outdoors and the spirit of the environmental movement of the 60s and 70s.
        </p>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-20 px-4 py-20 md:flex-row">
        <div className="space-y-6">
          <h3 className="brand-header text-4xl">our mission</h3>
          <p className="text-lg">
            To support and encourage sustainable slow travel.
            <br />
            <br />
            Build a community around a shared love of nature and authenticity.
            <br />
            <br />
            Support the growing community of eco-conscious van living remote workers and digital nomads.
            <br />
            <br />
            Provide all the necessary digital tools and features for effortless authentic van travel.
            <br />
            <br />
            Facilitate environmentalism with opportunities for voluntary work and ecological education.
            <br />
            <br />
            Promote and support nature photography, film and art.
          </p>
        </div>
        <img src="/landing/landing2.png" className="rounded-xs w-full max-w-[400px] object-cover" />
      </div>
      <div className="px-4 py-20 md:py-32">
        <div className="mx-auto max-w-6xl space-y-4">
          <div>
            <h3 className="brand-header text-4xl">request access now</h3>
            <p className="text-lg">To maintain an authentic and trustworthy community, members can only join via invite.</p>
          </div>
          <RequestAccessForm mode="dark" />
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-20 px-4 py-20 md:flex-row">
        <div className="space-y-6">
          <h3 className="brand-header text-4xl">features</h3>
          <p className="text-lg">
            A curated list of camper spots, verified by experienced van travelers. Reviewed and rated.
            <br />
            <br />
            Outdoor activity spots for surfing, hiking, mountain biking, climbing and more.
            <br />
            <br />
            Community of creative and nature loving van folk. Share and follow travelers profiles including info on their beloved
            van build.
            <br />
            <br />
            Renewable diesel fill-up stations, trustworthy mechanics and essential part suppliers.
            <br />
            <br />
            Useful and informative map layers for weather, bio-diversity, cellular signal, light pollution and more.
            <br />
            <br />
            Add your own spots and keep them organized in custom lists,
          </p>
        </div>
        <img src="/landing/landing3.png" className="rounded-xs w-full max-w-[400px] object-cover" />
      </div>

      <div className="flex flex-col items-center space-y-4 px-4 py-24">
        <p className="max-w-md text-center text-lg">
          “Finally a van life app that is purpose built for authentic, nature lovers from the digital age.”
        </p>
        <div className="flex flex-col items-center">
          <img src="/landing/landing4.png" className="sq-20 rounded object-cover" />
          <i className="text-xl font-bold">Beth Johnstone</i>
          <i>@sheisthelostgirl</i>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center space-y-8 px-4 py-20 text-center md:py-32">
        <div>
          <h3 className="brand-header text-4xl">get access now</h3>
          <p className="text-lg">To maintain an authentic and trustworthy community, members can only join via invite.</p>
        </div>
        <RequestAccessForm mode="dark" />
      </div>
    </div>
  )
}

function RequestAccessForm({ mode }: { mode?: "light" | "dark" }) {
  // eslint-disable-next-line
  const accessFetcher = useFetcher<any>()

  if (accessFetcher.data?.success)
    return (
      <div>
        <p className={join("text-black", mode === "dark" && "text-white")}>Thanks! We will get in contact soon!</p>
      </div>
    )

  return (
    <accessFetcher.Form action="/home" className="flex flex-col gap-2 sm:flex-row">
      <div>
        <input
          required
          defaultValue={accessFetcher.data?.data?.email || ""}
          name="email"
          placeholder="Email"
          className="rounded-xs h-10 border px-4 text-black focus:bg-white"
        />
        {!accessFetcher.data?.success && accessFetcher.data?.fieldErrors?.email && (
          <p className={join("text-black", mode === "dark" && "text-white")}>{accessFetcher.data.fieldErrors.email}</p>
        )}
        {!accessFetcher.data?.success && accessFetcher.data?.formError && (
          <p className={join("text-black", mode === "dark" && "text-white")}>{accessFetcher.data.formError}</p>
        )}
      </div>

      <div>
        <button
          disabled={accessFetcher.state === "submitting"}
          className={merge(
            "border-xs rounded-xs h-10 whitespace-nowrap bg-black px-4 text-center text-white hover:opacity-80 disabled:opacity-70",
            mode === "dark" && "bg-white text-black",
          )}
        >
          Request access
        </button>
      </div>
    </accessFetcher.Form>
  )
}
