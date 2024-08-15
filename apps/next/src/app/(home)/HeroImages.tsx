"use client"
import * as React from "react"

export function HeroImage1() {
  const backgroundRef = React.useRef<HTMLDivElement>(null)
  const backgroundRefMob = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop
      const scale = 1 + scrollTop / 10000 // Adjust the divisor to control the scaling speed
      console.log("scrollTop", scrollTop)
      if (scrollTop < 1400 && backgroundRef.current) {
        backgroundRef.current.style.transform = `scale(${scale})`
      }
      if (scrollTop < 1400 && backgroundRefMob.current) {
        backgroundRefMob.current.style.transform = `scale(${scale})`
      }
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <>
      <div
        className="block md:hidden h-[208vh] md:h-[200vh] bg-cover md:bg-cover bg-[center_bottom_12rem] md:bg-[center_top_-6rem]"
        style={{
          backgroundImage: "url(/landing/hero1-mob.png)",
          transformOrigin: "center", // Ensure the scaling is centered
          transition: "transform 0.1s linear", // Optional: smooth out the scaling transition
        }}
        ref={backgroundRefMob}
      />
      <div
        className="hidden md:block h-[208vh] md:h-[200vh] bg-cover md:bg-cover bg-[center_top_-13rem] md:bg-[center_top_-6rem]"
        style={{
          backgroundImage: "url(/landing/hero1.png)",
          transformOrigin: "center", // Ensure the scaling is centered
          transition: "transform 0.1s linear", // Optional: smooth out the scaling transition
        }}
        ref={backgroundRef}
      />
    </>
  )
}

export function HeroImage5() {
  const backgroundRef = React.useRef<HTMLDivElement>(null)
  const backgroundRefMob = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop - 2500

      const scale = 1 + scrollTop / 12000 // Adjust the divisor to control the scaling speed
      if (scrollTop > 0 && backgroundRef.current) {
        backgroundRef.current.style.transform = `scale(${scale})`
      }
      if (scrollTop > 0 && backgroundRefMob.current) {
        backgroundRefMob.current.style.transform = `scale(${scale})`
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <>
      <div
        className="block md:hidden h-[230vh] md:h-[210vh] bg-cover md:bg-cover [background-position-y:bottom] md:bg-[center_top_-10rem]"
        style={{
          backgroundImage: "url(/landing/hero5-mob.png)",
          transformOrigin: "center", // Ensure the scaling is centered
          transition: "transform 0.1s linear", // Optional: smooth out the scaling transition
        }}
        ref={backgroundRefMob}
      />
      <div
        className="hidden md:block h-[240vh] md:h-[210vh] bg-cover md:bg-cover bg-[center_top_0rem] md:bg-[center_top_-10rem]"
        style={{
          backgroundImage: "url(/landing/hero5.png)",
          transformOrigin: "center", // Ensure the scaling is centered
          transition: "transform 0.1s linear", // Optional: smooth out the scaling transition
        }}
        ref={backgroundRef}
      />
    </>
  )
}
