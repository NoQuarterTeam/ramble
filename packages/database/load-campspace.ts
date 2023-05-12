import * as cheerio from "cheerio"
import * as puppeteer from "puppeteer"
import fs from "fs"

// const url = "https://www.pureportugal.co.uk/properties/?cat=54+54+99+54+54+54-&landmin=0&landmax=0&order=ASC&v="
const url = `https://campspace.com/en/campsites?numberOfAdults=1&numberOfChildren=0&filter%5Baccommodations%5D%5B%5D=bring_minivan&page=`
const pageCount = 1

import data from "./campspace.json"

export type Spot = {
  latitude: number
  longitude: number
  name: string
  image?: string | undefined
  price: number
  link: string
}

let currentData: Spot[] = data

async function getPageCards(page: puppeteer.Page, currentPage: number) {
  const res = await fetch(url + currentPage)
  const html = await res.text()

  const $ = cheerio.load(html)

  const links: { link: string; name: string; image: string | undefined }[] = []
  $("article.card").each((_, card) => {
    console.log("the fuck", $(card).attr("data-id"))
    const link = $(card).find(".card-header-a").attr("href")
    let images
    if (link && link.includes("https://campspace")) {
      // find image and get src
      $(card)
        .find($(".card-images-img"))
        .each((_, image) => images.push(image.attribs.src))
      console.log({ images })
      // const name = $(card).find("h1")
      // links.push({ link: card.attribs.href.trim(), name: name.text(), image: image.attr("data-lazy-src") })
    }
  })
  return

  // for (let index = 0; index < links.length; index++) {
  //   let price: number | undefined
  //   const spot = links[index]
  //   try {
  //     console.log(spot.link)
  //     // if in data.json, continue
  //     // const exists = currentData.find((s) => s.link === spot.link)
  //     // if (exists) continue

  //     // use puppeteer to open link, parse html, and find the img with class "leaflet-marker-icon" and click it
  //     await page.goto(spot.link, { waitUntil: "domcontentloaded" })
  //     if (index === 0) {
  //       await page.waitForSelector("#ml-webforms-popup-166849", { visible: true }).catch()
  //       // remove element from dom
  //       await page.evaluate(() => {
  //         // @ts-ignore document is in pup
  //         const element = document.querySelector("#ml-webforms-popup-166849")
  //         if (element) element.remove()
  //         // @ts-ignore document is in pup
  //         const element2 = document.querySelector("#ml-webforms-popup-166849-overlay")
  //         if (element2) element2.remove()
  //       })
  //     }
  //     // await page.keyboard.press("End")
  //     await page.waitForSelector(".leaflet-marker-icon", { visible: true, timeout: 4000 })
  //     const html = await page.content()
  //     const $ = cheerio.load(html)
  //     // find h2 and get inner text

  //     const priceText = $(".price").text()
  //     // extract price from string, Price: €8,000

  //     price = parseInt(priceText.split("Price: ")[1].replace("€", "").replace(",", ""))

  //     await page.click(".leaflet-marker-icon")
  //     await page.waitForSelector(".mapp-ib-wrapper", { visible: true, timeout: 4000 })

  //     const html2 = await page.content()
  //     const $2 = cheerio.load(html2)
  //     // find div with class name of "mapp-title" and log inner text
  //     const location = $2(".mapp-title").text()

  //     const latitude = parseFloat(location.split(",")[0])
  //     const longitude = parseFloat(location.split(",")[1])

  //     if (latitude && longitude) {
  //       // write data to json file
  //       currentData.push({ name: spot.name, image: spot.image, latitude, longitude, price, link: spot.link })
  //       fs.writeFileSync("./campspace.json", JSON.stringify(currentData, null, 2))
  //     } else {
  //       throw new Error("no location")
  //     }
  //   } catch {}
  // }
}

async function main() {
  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    // loop over each page
    for (let currentPage = 1; currentPage < pageCount + 1; currentPage++) {
      await getPageCards(page, currentPage)
    }
    await browser.close()
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

main().finally(() => process.exit(0))
