import Link from "next/link"

export function AppCta({ message }: { message?: string }) {
  return (
    <div className="p-4 border rounded-sm">
      <p className="pb-2 text-center text-lg">{message || "Download the app to access more features"}</p>
      <div className="flex items-center justify-center space-x-2">
        <Link
          target="_blank"
          rel="noreferer noopener"
          href="https://apps.apple.com/app/ramble-van-travel-app/id6468265289?itsct=apps_box_badge&amp;itscg=30200"
        >
          <img
            src="https://ramble.guide/apple.svg"
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
  )
}
