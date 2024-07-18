import { PageContainer } from "@/components/PageContainer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/Accordion"
import { Instagram } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function Home() {
  return (
    <div className="dark bg-background font-serif text-white">
      <div className="w-screen space-y-2 bg-[url('/landing/hero1.png')] bg-cover px-2 md:px-12 pt-4 md:pt-32">
        <h1 className="text-[300px] leading-[250px] italic font-bold text-primary">ramble</h1>
        <p className="text-2xl md:pl-4 font-semibold max-w-md">
          community for the modern van traveler looking for genuine connections and meaningful experiences.
        </p>
        <p className="text-3xl pt-[1000px] pb-40 font-semibold max-w-3xl">
          a new generation of remote working, digitally connected travelers looking for untouched nature, genuine connection and a
          more holistic way to travel and live.
        </p>
      </div>
      <div className="py-40 px-2 md:px-12">
        <div className="px-8 lg:px-20">
          <Image src="/landing/hero2.png" alt="hero2" width={350} height={350} className="object-cover -rotate-[20deg]" />
        </div>
        <div className="px-8 lg:px-20 flex justify-end">
          <Image src="/landing/hero3.png" alt="hero3" width={350} height={350} className="object-cover rotate-[16deg]" />
        </div>
        <div className="px-8 lg:px-20">
          <Image src="/landing/hero4.png" alt="hero4" width={350} height={350} className="object-cover -rotate-[10deg]" />
        </div>
        <p className="text-3xl pt-40 font-semibold max-w-3xl">
          together with a team of experienced Guides, <span className="text-primary">ramble</span> offers curated camp stays,
          services, hospitality spots and experiences all with a focus on sustainability, wellness and nature connection.
        </p>
      </div>
      <div className="w-screen pt-[1100px] pb-40 space-y-6 bg-[url('/landing/hero5.png')] bg-cover px-2 md:px-12">
        <div className="max-w-lg space-y-4">
          <p className="font-bold text-2xl text-primary">what you get...</p>
          <p className="font-bold text-lg">only the best “off-the-beaten-path” spots</p>
          <p>
            a hand picked selection of camper stays, verified by experienced van travellers. Reviewed and rated by an invite only
            community to ensure the best possible locations.
          </p>
        </div>
        <Accordion type="single" collapsible className="max-w-2xl">
          {features.map((feat) => (
            <AccordionItem key={feat.q} value={feat.q}>
              <AccordionTrigger>{feat.q}</AccordionTrigger>
              <AccordionContent className="text-base">{feat.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <div className="px-8 lg:px-20 space-y-40 py-40">
        <div className="flex justify-end">
          <Image src="/landing/hero6.png" alt="hero6" width={350} height={350} className="object-cover rotate-[16deg]" />
        </div>
        <div className="flex justify-end">
          <Image src="/landing/hero7.png" alt="hero7" width={350} height={350} className="object-cover rotate-[16deg]" />
        </div>
      </div>

      <div className="flex mb-40 items-center justify-center py-20 bg-primary">
        <PageContainer className="flex w-full justify-between gap-4">
          <div className="flex flex-col flex-1 gap-4 items-center justify-center">
            <p className="text-white text-6xl font-bold italic pr-6">download now</p>
            <div className="flex items-center justify-center space-x-2">
              <Link
                target="_blank"
                rel="noreferer noopener"
                href="https://apps.apple.com/app/ramble-van-travel-app/id6468265289?itsct=apps_box_badge&amp;itscg=30200"
              >
                <img
                  src="https://ramble.guide/apple.png"
                  alt="Download on the App Store"
                  width={200}
                  height={80}
                  className="object-contain"
                />
              </Link>
              <Link
                target="_blank"
                rel="noreferer noopener"
                href="https://play.google.com/store/apps/details?id=co.noquarter.ramble&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"
              >
                <img
                  width={250}
                  height={100}
                  className="object-contain"
                  alt="Get it on Google Play"
                  src="https://ramble.guide/google.png"
                />
              </Link>
            </div>
          </div>
          <div className="relative flex-1">
            <Image
              src="/landing/hero8.png"
              alt="hero8"
              width={250}
              height={543}
              className="object-cover w-[250px] absolute top-1/2 left-0 -translate-y-[50%]"
            />
            <Image
              src="/landing/hero10.png"
              alt="hero10"
              width={250}
              height={543}
              className="object-cover w-[250px] absolute top-1/2 right-0 -translate-y-[50%]"
            />
            <Image
              src="/landing/hero9.png"
              alt="hero9"
              width={300}
              height={600}
              className="object-cover w-[300px] absolute top-1/2 right-1/2 -translate-y-1/2 translate-x-1/2"
            />
          </div>
        </PageContainer>
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
                <Image
                  src="https://ramble.guide/apple.png"
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
                <Image
                  width={125}
                  height={40}
                  className="object-contain"
                  alt="Get it on Google Play"
                  src="https://ramble.guide/google.png"
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

const features = [
  {
    q: "only the best “off-the-beaten-path” spots",
    a: "a hand picked selection of camper stays, verified by experienced van travellers. Reviewed and rated by an invite only community to ensure the best possible locations.",
  },
  {
    q: "find things to do nearby, get active or explore the local culture",
    a: "asfaf",
  },
  {
    q: "bump into other people who are just as crazy as you are",
    a: "asfaf",
  },
  {
    q: "a map with all the info you need to get the most from your trip",
    a: "asfaf",
  },
  {
    q: "collect your wish list and share it with your travel mates",
    a: "asfaf",
  },
  {
    q: "plan future trips and re-live your past ones",
    a: "asfaf",
  },
  {
    q: "trusted services and shops to keep you on the road",
    a: "asfaf",
  },
  {
    q: "connect deeper with the local region and environment",
    a: "asfaf",
  },
]
