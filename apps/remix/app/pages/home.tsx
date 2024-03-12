import { userSchema } from "@ramble/server-schemas"
import {
  createAccessRequest,
  sendAccessRequestConfirmationEmail,
  sendSlackMessage,
  updateLoopsContact,
} from "@ramble/server-services"
import { join, merge } from "@ramble/shared"
import { Link, useLoaderData } from "@remix-run/react"
import { Instagram } from "lucide-react"
import { ClientOnly } from "remix-utils/client-only"
import { HoneypotInputs, HoneypotProvider } from "remix-utils/honeypot/react"

import { SpamError } from "remix-utils/honeypot/server"
import { Form, useFetcher } from "~/components/Form"
import { PageContainer } from "~/components/PageContainer"
import { Spinner } from "~/components/ui"
import { track } from "~/lib/analytics.server"
import { db } from "~/lib/db.server"
import { type ActionDataErrorResponse, formError, validateFormData } from "~/lib/form.server"
// import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { json } from "~/lib/remix.server"
import type { ActionFunctionArgs } from "~/lib/vendor/vercel.server"
import { honeypot } from "~/services/honeypot.server"

const schema = userSchema.pick({ email: true })

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const result = await validateFormData(request, schema)
    if (!result.success) return formError(result)

    const formData = await request.formData()
    honeypot.check(formData)

    const accessRequest = await db.accessRequest.findFirst({ where: { email: result.data.email } })
    if (accessRequest) return formError({ formError: "Email already requested access" })

    const codeResult = await createAccessRequest(result.data.email)
    if (!codeResult.success) return formError({ formError: "Error creating request, please try again" })

    void updateLoopsContact({
      inviteCode: codeResult.code,
      email: result.data.email,
      accessRequestedAt: new Date().toISOString(),
    })
    void sendSlackMessage(`🚀 New access request from ${result.data.email}`)
    void sendAccessRequestConfirmationEmail(result.data.email)
    track("Access requested", { email: result.data.email })
    return json({ success: true })
  } catch (error) {
    if (error instanceof SpamError) {
      return json({ success: true })
    }
    return json({ success: false }, request, { flash: { type: "error", title: "Error creating request" } })
  }
}

export const loader = () => {
  return json({ honeypotInputProps: honeypot.getInputProps() })
}

export default function Home() {
  const { honeypotInputProps } = useLoaderData<typeof loader>()

  const randomPerson = PEOPLE[Math.floor(Math.random() * PEOPLE.length)]
  return (
    <HoneypotProvider {...honeypotInputProps}>
      <div className="dark bg-background font-serif text-white">
        <div className="h-[94vh] w-screen space-y-20 bg-[url('/landing/hero.avif')] bg-center bg-cover px-2 pt-10">
          <div className="mx-auto flex max-w-7xl flex-col items-start space-y-8">
            <div className="flex flex-col items-center">
              <p className="brand-header text-5xl">ramble</p>
              <p className="font-semibold text-black text-lg">VAN TRAVEL APP</p>
            </div>
            <div className="max-w-3xl space-y-2">
              <h1 className="max-w-4xl font-bold text-2xl text-black md:text-5xl">
                Everything you need for van life <br />
                in Europe.
              </h1>
              <h2 className="text-black text-lg md:text-xl">
                For a new generation of remote working, digitally connected and eco-conscious travellers.
              </h2>
            </div>

            <RequestAccessForm />
          </div>
        </div>
        <div className="flex justify-end px-6">
          <a href="https://unsplash.com/@tobiastu" target="_blank" rel="noreferrer noopener" className="hover:opacity-80">
            Photo by: Tobias Tullius
          </a>
        </div>
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <p className="text-2xl">
            Built for a new generation of{" "}
            <span className="font-semibold text-primary">remote working, digitally connected travelers</span> looking for{" "}
            <span className="font-semibold text-primary">authentic</span> nature, genuine connection and a more sustainable way to
            travel.
            <br />
            <br />
            Inspired by the great outdoors and the spirit of the environmental movement of the 60s and 70s.
          </p>
        </div>
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-20 px-4 py-20 md:flex-row">
          <div className="space-y-12">
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
          </div>
          <div>
            <img
              width={500}
              height={800}
              alt="mission"
              src="/landing/mission.avif"
              className="min-w-full rounded-xs object-cover md:min-w-[40%]"
            />
            <div className="flex justify-end px-2">
              <a
                href="https://unsplash.com/@danieljschwarz"
                target="_blank"
                rel="noreferrer noopener"
                className="hover:opacity-80"
              >
                Photo by: Daniel J. Schwarz
              </a>
            </div>
          </div>
        </div>
        <div className="bg-primary-50/5 px-4 py-20 md:py-32">
          <div className="mx-auto max-w-6xl space-y-4">
            <div>
              <h3 className="brand-header text-4xl">join the beta now</h3>
              <p className="text-lg">
                To maintain an authentic and trustworthy community, members can currently only join via invite.
              </p>
            </div>
            <RequestAccessForm mode="dark" />
          </div>
        </div>
        <div className="mx-auto max-w-6xl space-y-20 px-4 py-20">
          <div>
            <h3 className="brand-header text-4xl">features</h3>
            <p className="text-lg">Here are some of the things you can expect to see.</p>
          </div>
          {FEATURES.map((feature, i) => (
            <div
              key={feature.slice(0, 10)}
              className={join(
                "flex flex-col items-center justify-between gap-10 md:flex-row md:gap-40",
                i % 2 && "md:flex-row-reverse",
              )}
            >
              <p className="text-2xl">{feature}</p>
              <img
                src={`/landing/features${i + 1}.png`}
                alt={`features ${i + 1}`}
                width={300}
                height={300}
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <ClientOnly>
          {() => (
            <div className="flex flex-col items-center space-y-6 px-4 py-24">
              <p className="max-w-md text-center text-lg">“{randomPerson?.message}”</p>
              <a
                href={`https://www.instagram.com/${randomPerson?.handle}/`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center"
              >
                <img
                  width={100}
                  height={100}
                  alt="testimony user"
                  src={randomPerson?.image}
                  className="sq-24 rounded-full object-cover"
                />
                <i className="pt-4 font-bold text-xl">{randomPerson?.name}</i>
                <i>@{randomPerson?.handle}</i>
              </a>
            </div>
          )}
        </ClientOnly>

        <div className="mx-auto flex max-w-7xl flex-col items-center space-y-8 px-4 py-20 text-center md:py-32">
          <div>
            <h3 className="brand-header text-4xl">get access now</h3>
            <p className="text-lg">To maintain an authentic and trustworthy community, members can only join via invite.</p>
          </div>
          <RequestAccessForm mode="dark" />
        </div>
        <div className="border-t">
          <PageContainer className="flex items-center justify-between space-y-0 px-4 py-6">
            <div className="space-y-4">
              <p className="brand-header text-2xl">ramble</p>
            </div>
            <a
              aria-label="go to instagram"
              href="https://instagram.com/ramble.guide"
              target="_blank"
              rel="noreferrer noopener"
              className="hover:opacity-70"
            >
              <Instagram />
            </a>

            <Link to="/privacy" className="text-sm hover:opacity-70">
              Privacy
            </Link>
          </PageContainer>
        </div>
      </div>
    </HoneypotProvider>
  )
}

const formKey = "access-request"
function RequestAccessForm({ mode }: { mode?: "light" | "dark" }) {
  const accessFetcher = useFetcher<ActionDataErrorResponse<typeof schema>>({ key: formKey })

  if (accessFetcher.data?.success)
    return (
      <div>
        <p className={join("text-black", mode === "dark" && "text-white")}>Thanks! We will get in contact soon!</p>
      </div>
    )

  return (
    <Form fetcherKey={formKey} action="/home" className="flex flex-col gap-2 sm:flex-row">
      <div>
        <HoneypotInputs />
        <input required name="email" placeholder="Email" className="h-10 rounded-xs border px-4 text-black focus:bg-white" />
        {accessFetcher.data?.fieldErrors?.email && (
          <p className={join("text-black", mode === "dark" && "text-white")}>{accessFetcher.data.fieldErrors.email}</p>
        )}
        {accessFetcher.data?.formError && (
          <p className={join("text-black", mode === "dark" && "text-white")}>{accessFetcher.data.formError}</p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={accessFetcher.state === "submitting"}
          className={merge(
            "flex h-10 w-[100px] items-center justify-center whitespace-nowrap rounded-xs border-xs bg-black px-4 text-center text-white disabled:opacity-70 hover:opacity-80",
            mode === "dark" && "bg-white text-black",
          )}
        >
          {accessFetcher.state === "submitting" ? <Spinner /> : "Join beta"}
        </button>
      </div>
    </Form>
  )
}

const PEOPLE = [
  {
    name: "George Borg",
    handle: "gkborg",
    image: "/landing/people/george.avif",
    message: "Finally a van life app that is purpose built for nature lovers from the digital age.",
  },
  {
    name: "Jack Clackett",
    handle: "jack__jsy",
    image: "/landing/people/jack.avif",
    message: "The only app you need for van life in Europe. Trustworthy spots from a community of like-minded travellers.",
  },
  {
    name: "Rosa Bertram",
    handle: "rosieontheroad_",
    image: "/landing/people/rosa.avif",
    message: "The only app you need for van life in Europe. Trustworthy spots from a community of like-minded travellers.",
  },
]

const FEATURES = [
  "A curated list of camper spots, verified by experienced van travellers. Reviewed and rated by the community to ensure the best possible locations.",
  "Find nearby outdoor activity spots for surfing, hiking, mountain biking, climbing and more, ",
  "A community of creative and nature loving van folk. Share and follow traveller’s profiles including info on their beloved van build.",
  "Useful and informative map layers for weather, bio-diversity, cellular signal, light pollution and more.",
  "Add your own spots and keep them organized in custom lists. Follow and copy other members’ lists for inspiration for your next trip.",
  "Renewable diesel fill-up stations, electric charging points, trustworthy mechanics and essential part suppliers.",
]
