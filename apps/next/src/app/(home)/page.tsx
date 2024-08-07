import { PageContainer } from "@/components/PageContainer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/Accordion"
import { merge } from "@ramble/shared"
import { Instagram } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { HeroImage1, HeroImage5 } from "./HeroImages"

export default function Home() {
  return (
    <div className="dark bg-background font-serif text-white w-screen scroll-smooth">
      <div className="relative w-screen px-3 md:px-6 h-[175vh] md:h-[200vh] flex flex-col justify-between">
        <div className="absolute z-0 inset-0  max-w-[100vw] overflow-hidden">
          <HeroImage1 />
        </div>
        <div className="relative justify-center flex flex-col pt-[30vh] md:pt-[10vh]">
          <h1 className="text-[28vw] leading-none italic font-extrabold text-primary">ramble</h1>
          <div className="relative">
            <Image
              src="/landing/hero0-mob.png"
              alt="hero0"
              width={1200}
              height={7000}
              className="block md:hidden absolute pointer-events-none right-[0vw] md:right-[7vw] lg:right-[10vw] z-10 h-[765vh] -top-[3vw] md:top-[-5vw]"
            />
            <Image
              src="/landing/hero0.png"
              alt="hero0"
              width={1200}
              height={7000}
              className="hidden md:block absolute pointer-events-none right-[0vw] md:right-[7vw] lg:right-[10vw] z-10 h-[765vh] -top-[3vw] md:top-[-5vw]"
            />
            <p className="text-xl md:text-3xl pl-1 md:pl-4 -mt-3 md:-mt-[3rem] max-w-[50vw] md:max-w-[75vw]">
              community app for the modern van traveler
            </p>
          </div>
        </div>
        <p className="relative text-2xl lg:text-5xl pb-[6vw] font-semibold max-w-[80vw] md:max-w-[70vw]">
          built for a <span className="text-primary font-bold italic">new generation</span> of adventurous, digitally connected
          travelers looking for untouched nature, genuine connection and a more holistic way to travel and live in Europe.
        </p>
      </div>
      <div className="relative w-screen px-3 md:px-6 h-[170vh] md:h-[230vh] flex flex-col justify-between bg-[url('/landing/bg-contors.png')] bg-cover">
        <div>
          <div className="pt-[5vh] md:pt-[15vh] pl-[10vw] md:pl-[5vw]">
            <Image
              src="/landing/hero2.png"
              alt="hero2"
              width={420}
              height={420}
              className="object-cover -rotate-[14deg] w-[150px] md:w-[420px] h-[150px] md:h-[420px]"
            />
          </div>
          <div className="relative flex flex-col md:flex-row justify-between align-bottom md:items-end">
            <div className="pt-[5vh] md:pt-[15vh] pl-[5vw] md:pl-[20vw]">
              <Image
                src="/landing/surfers.png"
                alt="surfers"
                width={234}
                height={180}
                className="w-[130px] md:w-[234px] h-[100px] md:h-[180px]"
              />
            </div>
            <Image
              src="/landing/hero3.png"
              alt="hero3"
              width={440}
              height={440}
              className={merge(
                "transition-opacity duration-500 object-cover rotate-[12deg] mr-[5vw] self-end mt-[16vh] md:mt-0 w-[160px] md:w-[440px] h-[160px] md:h-[440px]",
                // !isNegative && "opacity-0",
              )}
            />
            {/* <Image
              src="/landing/hero3-negative.png"
              alt="hero3"
              width={440}
              height={440}
              className={`transition-opacity duration-500 ${!isNegative ? "opacity-100" : "opacity-0"} object-cover rotate-[12deg] absolute right-[5vw] bottom-0 w-[160px] md:w-[440px] h-[160px] md:h-[440px]`}
            /> */}
          </div>
        </div>
        <div className="px-8 lg:px-20 pt-[20vh] md:pt-[10vh]">
          <Image
            src="/landing/hero4.png"
            alt="hero4"
            width={535}
            height={350}
            className="object-cover -rotate-[6deg] ml-0 md:ml-32 w-[200px] md:w-[535px] h-[133px] md:h-[350px]"
          />
        </div>
        <p className="text-2xl lg:text-5xl pb-[6vw] font-semibold max-w-[75vw] md:max-w-[70vw]">
          together with a team of experienced{" "}
          <Link href="/guides" target="_blank" className="underline hover:text-sky-300">
            Guides
          </Link>
          , <span className="text-primary font-bold italic">ramble</span> offers curated camp stays, services, hospitality spots
          and experiences all with a focus on sustainability and nature connection.
        </p>
      </div>

      <div className="relative w-screen px-3 md:px-6  h-[225vh] md:h-[210vh] flex flex-col justify-end">
        <div className="absolute z-0 inset-0 max-w-[100vw] overflow-hidden">
          <HeroImage5 />
        </div>
        <div className="relative z-1 max-w-[75vw] md:max-w-5xl space-y-4 pb-[6vw]">
          <p className="font-bold text-3xl md:text-5xl text-primary italic">what you will discover...</p>
          <Accordion type="single" collapsible className="max-w-8xl" defaultValue={features[0].q}>
            {features.map((feat) => (
              <AccordionItem key={feat.q} value={feat.q} className="text-lg md:text-3xl border-dashed border-b-2 border-gray-500">
                <AccordionTrigger className="hover:text-sky-300 decoration-transparent text-left py-2 md:py-4">
                  {feat.q}
                </AccordionTrigger>
                <AccordionContent className="text-md md:text-xl max-w-[100%] md:max-w-[80%]">{feat.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
      <div className="relative w-screen px-3 md:px-6  h-[250vh] md:h-[180vh] flex flex-col justify-start items-end md:items-start bg-[url('/landing/bg-contors.png')] bg-cover">
        <div className="pt-[30vh] md:pt-[15vh] pl-0 md:pl-[5vw] pr-[10vw] flex flex-col justify-end">
          <Image
            src="/landing/hero7.png"
            alt="hero7"
            width={370}
            height={480}
            className="object-cover rotate-[9deg] md:-rotate-[9deg] w-[180px] md:w-[370px]"
          />
          <Image
            src="/landing/leaf.png"
            alt="van"
            width={180}
            height={120}
            className="object-cover w-[110px] md:w-[160px] mt-[10vh] md:mt-[25vh] self-end"
          />
        </div>
        <div className="px-8 lg:px-32 w-[100%] flex flex-end md:justify-end">
          <Image
            src="/landing/hero6.png"
            alt="hero6"
            width={400}
            height={360}
            className="object-cover -rotate-[16deg] md:rotate-[12deg] w-[180px] md:w-[400px] h-[180px] md:h-[400px] mt-[40vh] md:-mt-[60vh]"
          />
        </div>
      </div>
      <div className="bg-[url('/landing/bg-contors.png')] bg-cover pb-[180px] md:pb-60 relative">
        <div className="items-center justify-center bg-primary flex">
          <PageContainer className="w-full justify-between gap-4 flex-col-reverse md:flex-row flex">
            <div className="flex flex-col flex-1 gap-4 items-center justify-center relative">
              <p className="text-white text-4xl whitespace-nowrap lg:text-6xl font-bold italic pr-6">download now</p>
              <div className="flex items-center justify-center space-x-4">
                <Link
                  target="_blank"
                  rel="noreferer noopener"
                  className="h-[80px]"
                  href="https://apps.apple.com/app/ramble-van-travel-app/id6468265289?itsct=apps_box_badge&amp;itscg=30200"
                >
                  <img
                    src="/apple.png"
                    alt="Download on the App Store"
                    width={200}
                    height={80}
                    className="object-contain w-auto h-full"
                  />
                </Link>
                <Link
                  target="_blank"
                  rel="noreferer noopener"
                  className="h-[80px]"
                  href="https://play.google.com/store/apps/details?id=co.noquarter.ramble&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"
                >
                  <img
                    width={200}
                    height={80}
                    className="object-contain w-auto h-full"
                    alt="Get it on Google Play"
                    src="/google.png"
                  />
                </Link>
              </div>
            </div>
            <div className="relative flex flex-1 min-h-[180px] md:min-h-full">
              <Image
                src="/landing/hero11.png"
                alt="hero11"
                width={250}
                height={543}
                className="block md:hidden object-cover w-[700px] absolute top-0 md:top-[50px] right-0 -translate-y-[50%] z-10"
              />
              <Image
                src="/landing/hero11-mob.png"
                alt="hero11"
                width={250}
                height={543}
                className="hidden md:block object-cover w-[700px] absolute top-0 md:top-[50px] right-0 -translate-y-[50%] z-10"
              />
            </div>
          </PageContainer>
        </div>
        <Link
          href="https://unsplash.com/collections/BtpPU_1zyUc/ramble-home-page"
          target="_blank"
          className="absolute bottom-4 right-4 hover:text-sky-300"
        >
          Photo credits
        </Link>
      </div>
      <div className="border-t">
        <PageContainer className="flex justify-between px-4 py-6">
          <div className="flex-1 flex flex-col justify-start">
            <p className="text-primary font-bold italic text-2xl">ramble</p>
            <div className="flex items-start md:items-center flex-col md:flex-row gap-2 pt-4 md:pt-0">
              <Link
                target="_blank"
                rel="noreferer noopener"
                className="w-[120px] md:w-auto h-auto md:h-[30px]"
                href="https://apps.apple.com/app/ramble-van-travel-app/id6468265289?itsct=apps_box_badge&amp;itscg=30200"
              >
                <Image
                  src="/apple.png"
                  alt="Download on the App Store"
                  width={100}
                  height={30}
                  className="object-contain w-auto h-full"
                />
              </Link>
              <Link
                target="_blank"
                rel="noreferer noopener"
                className="w-[120px] md:w-auto h-auto md:h-[30px]"
                href="https://play.google.com/store/apps/details?id=co.noquarter.ramble&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"
              >
                <Image
                  height={30}
                  width={100}
                  className="object-contain w-auto h-full"
                  alt="Get it on Google Play"
                  src="/google.png"
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
    a: "a hand picked selection of camper stays, wild park ups, campsites and more verified by experienced van travellers. Added, reviewed and rated by an invite only community to ensure the best possible locations.",
  },
  {
    q: "things to do in the area, get active or explore the local culture",
    a: "whether you're looking for hiking, surfing, volunteering, or just a good place to grab a drink and enjoy some live music, our guides have added the best spots and experiences in the area.",
  },
  {
    q: "other people who are just as crazy as you are",
    a: "part of the appeal of van travel is the solitude and nature, but sometimes you just want to share a beer with someone who gets it. Find other travellers in the area, or connect with like-minded locals.",
  },
  {
    q: "a way to connect deeper with the local region and environment",
    a: "learn about the local ecology, re-wilding projects and cultural history. Connect deeper with the place you find yourself in.",
  },
  {
    q: "tools and data to help you plan your trip",
    a: "weather data, network strength and more to help you plan your trip and find your next stop.",
  },
  {
    q: "make lists that you can share with your travel mates",
    a: "have a look around for inspiring stays and add the spots you want to visit to your wish list. Share it with your travel mates and plan your next adventure together.",
  },
  {
    q: "planning for your future trips and a way to re-live your past ones",
    a: "put together your dream trip, plan every detail or just go with the flow. Save your past trips including photos and videos and re-live your memories whilst sharing them with your family and friends.",
  },
  {
    q: "trusted services, utilities and shops to keep you on the road",
    a: "whether your van (or dog) is in need of some repairs or you're looking for a way to reduce your impact on the road, ramble has a selection of reliable services and sustainable alternatives when you need them most.",
  },
]
