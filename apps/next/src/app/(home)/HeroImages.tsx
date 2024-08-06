export function HeroImage1() {
  // const [scaleHero1, setHero1Scale] = React.useState(1)

  // const handleScroll = React.useCallback(() => {
  //   const scrollY = window.scrollY
  //   const maxScale = 1.5 // Maximum scale for the zoom effect
  //   const zoomSpeed = 8000 // Higher value for slower zoom

  //   const newScale = 1 + scrollY / zoomSpeed
  //   setHero1Scale(Math.min(newScale, maxScale))
  // }, [])

  // React.useEffect(() => {
  //   window.addEventListener("scroll", handleScroll)
  //   return () => window.removeEventListener("scroll", handleScroll)
  // }, [handleScroll])

  return (
    <>
      <div
        className="block md:hidden h-[208vh] md:h-[200vh] bg-cover md:bg-cover bg-[center_top_-20rem] md:bg-[center_top_-6rem]"
        style={{
          backgroundImage: "url(/landing/hero1-mob.png)",
          // transform: `scale(${scaleHero1})`,
          transition: "transform 0.1s ease-out",
        }}
      />
      <div
        className="hidden md:block h-[208vh] md:h-[200vh] bg-cover md:bg-cover bg-[center_top_-20rem] md:bg-[center_top_-6rem]"
        style={{
          backgroundImage: "url(/landing/hero1.png)",
          // transform: `scale(${scaleHero1})`,
          transition: "transform 0.1s ease-out",
        }}
      />
    </>
  )
}

export function HeroImage5() {
  // const [scaleHero5, setHero5Scale] = React.useState(1)

  // const handleScroll = React.useCallback(() => {
  //   const scrollY = window.scrollY
  //   const maxScale = 1.5 // Maximum scale for the zoom effect
  //   const zoomSpeed = 8000 // Higher value for slower zoom

  //   if (scrollY > 3100) {
  //     const newScale = 1 + (scrollY - 3100) / zoomSpeed
  //     setHero5Scale(Math.min(newScale, maxScale))
  //   }
  // }, [])

  // React.useEffect(() => {
  //   window.addEventListener("scroll", handleScroll)
  //   return () => window.removeEventListener("scroll", handleScroll)
  // }, [handleScroll])

  return (
    <>
      <div
        className="block md:hidden h-[240vh] md:h-[210vh] bg-cover md:bg-cover bg-[center_top_0rem] md:bg-[center_top_-10rem]"
        style={{
          backgroundImage: "url(/landing/hero5-mob.png)",
          // transform: `scale(${scaleHero5})`,
          transition: "transform 0.1s ease-out",
        }}
      />
      <div
        className="hidden md:block h-[240vh] md:h-[210vh] bg-cover md:bg-cover bg-[center_top_0rem] md:bg-[center_top_-10rem]"
        style={{
          backgroundImage: "url(/landing/hero5.png)",
          // transform: `scale(${scaleHero5})`,
          transition: "transform 0.1s ease-out",
        }}
      />
    </>
  )
}
