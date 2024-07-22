import { PageContainer } from "@/components/PageContainer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/Accordion"
import { Instagram } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function Home() {
  return (
    <div className="dark bg-background font-serif text-white w-screen overflow-hidden">
      <div className="w-screen relative space-y-2 bg-[url('/landing/hero1.png')] bg-cover px-2 md:px-6 pt-4 md:pt-32">
        <h1 className="text-[calc(100vw/3.45)] lg:leading-[280px] italic font-bold text-primary">ramble</h1>
        <Image
          src="/landing/hero0.png"
          alt="hero0"
          width={1200}
          height={7000}
          className="absolute pointer-events-none top-44 md:top-[400px] right-32 md:right-[170px]"
        />

        <p className="text-4xl md:pl-4 pt-5 font-semibold max-w-2xl">
          community for the modern van traveler looking for genuine connections and meaningful experiences.
        </p>

        <p className="text-5xl pt-[1000px] pb-16 font-semibold max-w-5xl">
          together with a team of experienced <Link href="/guides" className='underline'>Guides</Link>, <span className="text-primary italic">ramble</span> offers curated camp stays,
          services, hospitality spots and experiences all with a focus on sustainability, wellness and nature connection.
        </p>
      </div>
      <div className="pt-32 pb-16 px-2 md:px-6 bg-[url('/landing/bg-contors.png')] bg-coverpy-40">
        <div className="px-8 lg:px-20">
          <Image src="/landing/hero2.png" alt="hero2" width={420} height={420} className="object-cover -rotate-[14deg]" />
        </div>
        <div className="px-8 lg:px-20 flex justify-between align-bottom">
          <div className='pl-64 py-20'>
            <Image src="/landing/surfers.png" alt="surfers" width={234} height={180}  />
          </div>
          <Image src="/landing/hero3.png" alt="hero3" width={440} height={440} className="object-cover -mt-20 rotate-[12deg]" />
        </div>
        <div className="px-8 lg:px-20 pt-64">
          <Image src="/landing/hero4.png" alt="hero4" width={535} height={350} className="object-cover -rotate-[6deg] ml-32" />
        </div>
        <p className="text-5xl pt-60 font-semibold max-w-5xl">
          built for a new generation of eco-conscious, digitally connected travelers looking for untouched nature, genuine connection and a more holistic way to travel and live.
        </p>
      </div>
      <div className="w-screen pt-[1100px] pb-40 space-y-6 bg-[url('/landing/hero5.png')] bg-cover px-2 md:px-12">
        <div className="max-w-4xl space-y-4">
          <p className="font-bold text-5xl text-primary italic">what you get...</p>
          <Accordion type="single" collapsible className="max-w-8xl" defaultValue={features[0].q}>
            {features.map((feat) => (
              <AccordionItem key={feat.q} value={feat.q} className='text-3xl border-dashed border-b-2 border-gray-600'>
                <AccordionTrigger className='hover:text-sky-300 decoration-transparent'>{feat.q}</AccordionTrigger>
                <AccordionContent className="text-xl">{feat.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
      <div className="px-8 lg:px-20 space-y-40 pt-20 pb-[480px] bg-[url('/landing/bg-contors.png')] bg-coverpy-40">
        <div className="px-8 lg:px-20">
          <Image src="/landing/hero7.png" alt="hero7" width={370} height={480} className="object-cover -rotate-[9deg]" />
        </div>
        <div className="px-8 lg:px-20 flex justify-between align-bottom">
          <div className='pl-28 py-20'>
            <Image src="/landing/van.png" alt="van" width={234} height={180}  />
          </div>
          <div>
            <Image src="/landing/hero6.png" alt="hero6" width={540} height={360} className="object-cover -mt-40 rotate-[12deg]" />
          </div>
        </div>
      </div>
      <div className="bg-[url('/landing/bg-contors.png')] bg-coverpy-40 pb-40">
        <div className="flex items-center justify-center py-20 bg-primary">
          <PageContainer className="flex w-full justify-between gap-4">
            <div className="flex flex-col flex-1 gap-4 items-center justify-center">
              <p className="text-white text-4xl whitespace-nowrap lg:text-6xl font-bold italic pr-6">download now</p>
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
            <div className="relative hidden md:flex flex-1">
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
