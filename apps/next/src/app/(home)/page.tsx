"use client"

import React from 'react'
import { PageContainer } from "@/components/PageContainer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/Accordion"
import { Instagram } from "lucide-react"
import Image from "next/image"
import Link from "next/link"


export default function Home() {
  const [isMobile, setIsMobile] = React.useState(false);
  const [isNegative, setIsNegative] = React.useState(false);
  const [scaleHero1, setHero1Scale] = React.useState(1);

  const [scaleHero5, setHero5Scale] = React.useState(1);


  const handleScroll = () => {
    const scrollY = window.scrollY;
    const maxScale = 1.5; // Maximum scale for the zoom effect
    const zoomSpeed = 8000; // Higher value for slower zoom

    const newScale = 1 + (scrollY / zoomSpeed);
    setHero1Scale(Math.min(newScale, maxScale));

    if (scrollY > 3100) {
      const newScale = 1 + ((scrollY-3100) / zoomSpeed);
      setHero5Scale(Math.min(newScale, maxScale));
    }

    if (scrollY > 1600 && scrollY < 2400) {
      setIsNegative(true);
    } else {
      setIsNegative(false);
    }

  };

  React.useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);



  return (
    <div className="dark bg-background font-serif text-white w-screen scroll-smooth">
      <Image
        src={isMobile ? "/landing/hero0-mob.png" : "/landing/hero0.png"}
        alt="hero0"
        width={1200}
        height={7000}
        className="absolute pointer-events-none top-[360px] md:top-[400px] right-[5px] md:right-[170px] z-10"
      />
      <div className="relative w-screen space-y-0 md:space-y-2 px-2 md:px-6 pt-4 md:pt-32 -mt-[75px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover md:bg-cover bg-top md:bg-bottom"
          style={{
            backgroundImage: `url(${isMobile ? '/landing/hero1-mob.png' : '/landing/hero1.png'})`,
            transform: `scale(${scaleHero1})`,
            transition: 'transform 0.1s ease-out'
          }}
        />
        <div className="relative z-1 pt-[30vh] md:pt-0">
          <h1 className="text-[calc(100vw/3.48)] lg:leading-[280px] italic font-extrabold text-primary">ramble</h1>
          <p className="text-xl md:text-2xl pl-1 md:pl-4 pt-0 md:pt-5 -mt-7 font-semibold md:mt-0 max-w-[300px] md:max-w-lg">
            community app for the modern van traveler looking for genuine connections and meaningful experiences.
          </p>

          <p className="text-2xl md:text-5xl pt-[550px] md:pt-[1000px] pb-8 md:pb-16 font-semibold max-w-[300px] md:max-w-5xl">
            together with a team of experienced <Link href="/guides" target='_blank' className='underline hover:text-sky-300'>Guides</Link>, <span className="text-primary font-bold italic">ramble</span> offers curated camp stays,
            services, hospitality spots and experiences all with a focus on sustainability, wellness and nature connection.
          </p>
        </div>
      </div>
      <div className="pt-16 md:pt-32 pb-16 px-2 md:px-6  bg-[url('/landing/bg-contors.png')] bg-cover py-40">
        <div>
          <Image src="/landing/hero2.png" alt="hero2" width={isMobile ? 150 : 420} height={isMobile ? 150 : 420} className="ml-[100px] md:ml-40 object-cover -rotate-[14deg]" />
        </div>
        <div className="px-2 lg:px-20 flex flex-col md:flex-row justify-between align-bottom relative">
          <div className='ml-10 md:ml-64 my-10 md:my-20'>
            <Image src="/landing/surfers.png" alt="surfers" width={isMobile ? 130 : 234} height={isMobile ? 100 : 180}  />
          </div>

          <Image src="/landing/hero3.png" alt="hero3" width={isMobile ? 160 : 440} height={isMobile ? 160 : 440} className={`transition-opacity duration-500 ${!isNegative ? 'opacity-0' : 'opacity-100'} object-cover mt-[33px] md:-mt-20 ml-[160px] md:ml-0 rotate-[12deg]`} />
          <Image src="/landing/hero3-negative.png" alt="hero3" width={isMobile ? 160 : 440} height={isMobile ? 160 :440} className={`transition-opacity duration-500 ${!isNegative ? 'opacity-100' : 'opacity-0'} object-cover mt-[30px] md:-mt-20 ml-[130px] md:ml-0 rotate-[12deg] absolute right-[31px] md:right-[80px] top-[183px] md:top-0`} />

        </div>
        <div className="px-8 lg:px-20 pt-56 md:pt-64">
          <Image src="/landing/hero4.png" alt="hero4" width={isMobile ? 200 : 535} height={isMobile ? 133 : 350} className="object-cover -rotate-[6deg] ml-0 md:ml-32" />
        </div>
        <p className="text-2xl md:text-5xl pt-20 md:pt-60 font-semibold max-w-[300px] md:max-w-5xl">
          built for a new generation of eco-conscious, digitally connected travelers looking for untouched nature, genuine connection and a more holistic way to travel and live.
        </p>
      </div>
      <div className="relative w-screen pt-[860px] md:pt-[1230px] pb-40 space-y-6 px-2 md:px-12 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${isMobile ? '/landing/hero5-mob.png' : '/landing/hero5.png'})`,
            transform: `scale(${scaleHero5})`,
            transition: 'transform 0.1s ease-out'
          }}
        />

        <div className="relative z-1 max-w-[280px] md:max-w-4xl space-y-4">
          <p className="font-bold text-3xl md:text-5xl text-primary italic">what you will find...</p>
          <Accordion type="single" collapsible className="max-w-8xl" defaultValue={features[0].q}>
            {features.map((feat) => (
              <AccordionItem key={feat.q} value={feat.q} className='text-lg md:text-3xl border-dashed border-b-2 border-gray-500'>
                <AccordionTrigger className='hover:text-sky-300 decoration-transparent text-left py-3 md:py-4'>{feat.q}</AccordionTrigger>
                <AccordionContent className="text-md md:text-xl">{feat.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
      <div className="px-8 lg:px-20 space-y-40 pt-20 pb-[240px] md:pb-[480px] bg-[url('/landing/bg-contors.png')] bg-cover">
        <div className="px-2 lg:px-20">
          <Image src="/landing/hero7.png" alt="hero7" width={370} height={480} className="object-cover rotate-[9deg] md:-rotate-[9deg] w-[180px] md:w-[370px] mt-[120px] md:mt-0 ml-[80px] md:ml-0" />
        </div>
        <div className="px-8 lg:px-20 flex justify-between align-bottom flex-col-reverse md:flex-row">
          <div>
            <Image src="/landing/leaf.png" alt="van" width={234} height={180} className="object-cover mt-[380px] md:mt-40 mb-0 md:mb-10 w-[110px] md:w-[210px] ml-[120px] md:ml-0" />
          </div>
          <div>
            <Image src="/landing/hero6.png" alt="hero6" width={540} height={360} className="object-cover mt-[60px] md:-mt-80 -rotate-[12deg] md:rotate-[12deg]  w-[220px] md:w-[550px] -ml-[40px] md:ml-0" />
          </div>
        </div>
      </div>
      <div className="bg-[url('/landing/bg-contors.png')] bg-cover pb-[180px] md:pb-40 relative">
        <div className="items-center justify-center bg-primary flex">
          <PageContainer className="w-full justify-between gap-4 flex-col-reverse md:flex-row flex">
            <div className="flex flex-col flex-1 gap-4 items-center justify-center relative">
              <p className="text-white text-4xl whitespace-nowrap lg:text-6xl font-bold italic pr-6">download now</p>
              <div className="flex items-center justify-center space-x-4">
                <Link
                  target="_blank"
                  rel="noreferer noopener"
                  className='h-[80px]'
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
                  className='h-[80px]'
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
                src={isMobile ? "/landing/hero11-mob.png" : "/landing/hero11.png"}
                alt="hero11"
                width={250}
                height={543}
                className="object-cover w-[700px] absolute top-0 md:top-[50px] right-0 -translate-y-[50%] z-20"
              />
            </div>
          </PageContainer>
        </div>
        <Link href="https://unsplash.com/collections/BtpPU_1zyUc/ramble-home-page" target='_blank' className='absolute bottom-4 right-4 hover:text-sky-300'>Photo credits</Link>
      </div>
      <div className="border-t">
        <PageContainer className="flex justify-between px-4 py-6">
          <div className="flex-1 flex flex-col justify-start">
            <p className="text-primary font-bold italic text-2xl">ramble</p>
            <div className="flex items-start md:items-center flex-col md:flex-row gap-2 pt-4 md: pt-0">
              <Link
                target="_blank"
                rel="noreferer noopener"
                className='w-[120px] md:w-auto h-auto md:h-[30px]'
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
                className='w-[120px] md:w-auto h-auto md:h-[30px]'
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
  {
    q: "a way to connect deeper with the local region and environment",
    a: "learn about the local ecology, re-wilding projects and cultural history. Connect deeper with the place you find yourself in.",
  },
]
