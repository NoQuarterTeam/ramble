import { useLoaderHeaders } from "~/lib/headers.server"

import { LoaderArgs } from "@remix-run/node"
import { z } from "zod"
import { FormError } from "~/components/Form"
import { formError, validateFormData } from "~/lib/form"
import { PageContainer } from "../components/PageContainer"

import { useFetcher } from "@remix-run/react"
import { json } from "@vercel/remix"
import { AuthenticityTokenInput } from "remix-utils"

export const config = {
  runtime: "edge",
}

export const headers = useLoaderHeaders

export const action = async ({ request }: LoaderArgs) => {
  const schema = z.object({ email: z.string().email() })
  const result = await validateFormData(request, schema)
  if (!result.success) return formError(result)

  console.log(result)

  return json({ success: true })
}

export default function Home() {
  return (
    <>
      <div className="h-[90vh] w-screen space-y-20 bg-[url('/landing/landing1.png')] pt-10 font-serif md:pt-28">
        <div className="mx-auto flex max-w-6xl flex-col items-start space-y-8">
          <div className="flex flex-col items-center">
            <p className="brand-header text-5xl">ramble</p>
            <p className="text-lg font-semibold text-black">VAN TRAVEL APP</p>
          </div>
          <div>
            <h1 className="text-2xl text-black">Everything you need for remote working & van life in Europe.</h1>
            <h2 className="text-xl text-black">For the outdoor enthusiasts who seek adventure, authenticity and community.</h2>
          </div>

          <div>
            <RequestAccessForm />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl py-20">
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
      <div className="mx-auto max-w-3xl space-y-6 py-20">
        <h3 className="brand-header text-4xl">our mission</h3>
        <p className="font-light">
          To support and encourage sustainable slow travel.
          <br />
          <br />
          Build a community around a shared love of nature and authenticity.
          <br />
          <br />
          Support the growing community of eco-concsious van living remote workers.
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
      <div className="mx-auto max-w-3xl space-y-6 py-20"></div>
      <div className="mx-auto max-w-3xl space-y-6 py-20">
        <h3 className="brand-header text-4xl">features</h3>
        <p className="font-light">
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

      <div className="bg-gray-50 py-10 dark:bg-gray-950">
        <PageContainer>
          <h3 className="text-xl italic">ramble</h3>
        </PageContainer>
      </div>
    </>
  )
}

function RequestAccessForm() {
  const accessFetcher = useFetcher()

  if (accessFetcher.data?.success)
    return (
      <div>
        <p className="text-black">Thanks! We will get in contact soon!</p>
      </div>
    )

  return (
    <accessFetcher.Form action="/home" method="POST" replace className="flex gap-2">
      <AuthenticityTokenInput />
      <div>
        <input
          required
          defaultValue={accessFetcher.data?.data?.email || ""}
          name="email"
          placeholder="Email"
          className="rounded-xs h-10 border px-4 text-black focus:bg-white"
        />
        {!accessFetcher.data?.success && accessFetcher.data?.fieldErrors?.email && (
          <p className="text-black">{accessFetcher.data.fieldErrors.email}</p>
        )}
        <FormError />
      </div>

      <button
        disabled={accessFetcher.state === "submitting"}
        className="border-xs rounded-xs h-10 whitespace-nowrap bg-black px-4 text-center text-white hover:opacity-80 disabled:opacity-70"
      >
        Request access
      </button>
    </accessFetcher.Form>
  )
}
