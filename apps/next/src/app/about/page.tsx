import { join } from "@ramble/shared"

import { PageContainer } from "@/components/PageContainer"
import { Instagram } from "lucide-react"
import Link from "next/link"

// const schema = userSchema.pick({ email: true })

// export const action = async ({ request }: ActionFunctionArgs) => {
//   try {
//     const result = await validateFormData(request, schema)
//     if (!result.success) return formError(result)

//     const formData = await request.formData()
//     honeypot.check(formData)

//     const accessRequest = await db.accessRequest.findFirst({ where: { email: result.data.email } })
//     if (accessRequest) return formError({ formError: "Email already requested access" })

//     const codeResult = await createAccessRequest(result.data.email)
//     if (!codeResult.success) return formError({ formError: "Error creating request, please try again" })

//     updateLoopsContact({
//       inviteCode: codeResult.code,
//       email: result.data.email,
//       accessRequestedAt: new Date().toISOString(),
//     })
//     sendSlackMessage(`🚀 New access request from ${result.data.email}`)
//     sendAccessRequestConfirmationEmail(result.data.email)
//     track("Access requested", { email: result.data.email })
//     return json({ success: true })
//   } catch (error) {
//     if (error instanceof SpamError) {
//       return badRequest("Error")
//     }
//     return json({ success: false }, request, { flash: { type: "error", title: "Error creating request" } })
//   }
// }

export default function Home() {
  const randomPerson = PEOPLE[Math.floor(Math.random() * PEOPLE.length)]
  return (
    <div className="dark bg-background font-serif text-white">
      <div className="h-[65vh] w-screen space-y-20 bg-[url('/landing/hero.avif')] bg-center bg-cover px-2 pt-32">
        <div className="mx-auto flex max-w-7xl flex-col items-start space-y-8">
          <div className="max-w-3xl space-y-2">
            <h1 className="max-w-4xl font-bold text-2xl text-black md:text-5xl">
              Everything you need for van life <br />
              in Europe.
            </h1>
            <h2 className="text-black text-lg md:text-xl">
              For a new generation of remote working, digitally connected and eco-conscious travellers.
            </h2>
            <div className="flex items-center">
              <Link
                target="_blank"
                rel="noreferer noopener"
                href="https://apps.apple.com/app/ramble-van-travel-app/id6468265289?itsct=apps_box_badge&amp;itscg=30200"
              >
                <img
                  src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&amp;releaseDate=1595289600"
                  alt="Download on the App Store"
                  width={120}
                  height={30}
                  className="object-contain"
                />
              </Link>
              <Link
                target="_blank"
                rel="noreferer noopener"
                href="https://play.google.com/store/apps/details?id=co.noquarter.ramble&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"
              >
                <img
                  width={145}
                  height={40}
                  className="object-contain"
                  alt="Get it on Google Play"
                  src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                />
              </Link>
            </div>
          </div>
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
            <h3 className="text-primary font-bold italic text-4xl">our mission</h3>
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
            <a href="https://unsplash.com/@danieljschwarz" target="_blank" rel="noreferrer noopener" className="hover:opacity-80">
              Photo by: Daniel J. Schwarz
            </a>
          </div>
        </div>
      </div>
      <div className="bg-primary-50/5 px-4 py-20 md:py-32">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="space-y-2">
            <h3 className="text-primary font-bold italic text-4xl">join the beta now</h3>
            <p>
              To maintain an authentic and trustworthy community, members can currently only join via invite. Download the app to
              request an invite.
            </p>
          </div>
          <div className="flex items-center">
            <Link
              target="_blank"
              rel="noreferer noopener"
              href="https://apps.apple.com/app/ramble-van-travel-app/id6468265289?itsct=apps_box_badge&amp;itscg=30200"
            >
              <img
                src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&amp;releaseDate=1595289600"
                alt="Download on the App Store"
                width={150}
                height={30}
                className="object-contain"
              />
            </Link>
            <Link
              target="_blank"
              rel="noreferer noopener"
              href="https://play.google.com/store/apps/details?id=co.noquarter.ramble&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"
            >
              <img
                width={195}
                height={60}
                className="object-contain"
                alt="Get it on Google Play"
                src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
              />
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl space-y-20 px-4 py-20">
        <div>
          <h3 className="text-primary font-bold italic text-4xl">features</h3>
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

      {/* <ClientOnly>
          {() => ( */}
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
      {/* )}
        </ClientOnly> */}

      <div className="mx-auto flex max-w-7xl flex-col items-center space-y-8 px-4 py-20 text-center md:py-32">
        <div className="space-y-2">
          <h3 className="text-primary font-bold italic text-4xl">get access now</h3>
          <p>
            To maintain an authentic and trustworthy community, members can currently only join via invite. Download the app to
            request an invite.
          </p>
        </div>
        <div className="flex items-center">
          <Link
            target="_blank"
            rel="noreferer noopener"
            href="https://apps.apple.com/app/ramble-van-travel-app/id6468265289?itsct=apps_box_badge&amp;itscg=30200"
          >
            <img
              src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&amp;releaseDate=1595289600"
              alt="Download on the App Store"
              width={150}
              height={30}
              className="object-contain"
            />
          </Link>
          <Link
            target="_blank"
            rel="noreferer noopener"
            href="https://play.google.com/store/apps/details?id=co.noquarter.ramble&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"
          >
            <img
              width={195}
              height={60}
              className="object-contain"
              alt="Get it on Google Play"
              src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
            />
          </Link>
        </div>
      </div>
      <div className="border-t">
        <PageContainer className="flex justify-between px-4 py-6">
          <div className="flex-1 flex flex-col justify-start">
            <p className="text-primary font-bold italic text-2xl">ramble</p>
            <div className="flex items-center">
              <Link
                target="_blank"
                rel="noreferer noopener"
                href="https://apps.apple.com/app/ramble-van-travel-app/id6468265289?itsct=apps_box_badge&amp;itscg=30200"
              >
                <img
                  src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&amp;releaseDate=1595289600"
                  alt="Download on the App Store"
                  width={100}
                  height={30}
                  className="object-contain"
                />
              </Link>
              <Link
                target="_blank"
                rel="noreferer noopener"
                href="https://play.google.com/store/apps/details?id=co.noquarter.ramble&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"
              >
                <img
                  width={125}
                  height={40}
                  className="object-contain"
                  alt="Get it on Google Play"
                  src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                />
              </Link>
            </div>
          </div>
          <div className="flex-1 justify-center items-center flex">
            <a
              aria-label="go to instagram"
              href="https://instagram.com/ramble.guide"
              target="_blank"
              rel="noreferrer noopener"
              className="hover:opacity-70"
            >
              <Instagram />
            </a>
          </div>

          <div className="flex-1 justify-end items-center flex">
            <Link href="/privacy" className="text-sm hover:opacity-70">
              Privacy
            </Link>
          </div>
        </PageContainer>
      </div>
    </div>
  )
}

// const formKey = "access-request"
// function RequestAccessForm({ mode }: { mode?: "light" | "dark" }) {
//   const accessFetcher = useFetcher<ActionDataErrorResponse<typeof schema>>({ key: formKey })

//   if (accessFetcher.data?.success)
//     return (
//       <div>
//         <p className={join("text-black", mode === "dark" && "text-white")}>Thanks! We will get in contact soon!</p>
//       </div>
//     )

//   return (
//     <Form fetcherKey={formKey} action="/home" className="flex flex-col gap-2 sm:flex-row">
//       <div>
//         <HoneypotInputs />
//         <input required name="email" placeholder="Email" className="h-10 rounded-xs border px-4 text-black focus:bg-white" />
//         {accessFetcher.data?.fieldErrors?.email && (
//           <p className={join("text-black", mode === "dark" && "text-white")}>{accessFetcher.data.fieldErrors.email}</p>
//         )}
//         {accessFetcher.data?.formError && (
//           <p className={join("text-black", mode === "dark" && "text-white")}>{accessFetcher.data.formError}</p>
//         )}
//       </div>

//       <div>
//         <button
//           type="submit"
//           disabled={accessFetcher.state === "submitting"}
//           className={merge(
//             "flex h-10 w-[100px] items-center justify-center whitespace-nowrap rounded-xs border-xs bg-black px-4 text-center text-white disabled:opacity-70 hover:opacity-80",
//             mode === "dark" && "bg-white text-black",
//           )}
//         >
//           {accessFetcher.state === "submitting" ? <Spinner /> : "Join beta"}
//         </button>
//       </div>
//     </Form>
//   )
// }

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
