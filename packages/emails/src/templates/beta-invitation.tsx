import { Container, Img, Link } from "@react-email/components"

import { EmailDocument } from "../components/EmailDocument"
import { EmailWrapper } from "../components/EmailWrapper"
import { Heading } from "../components/Heading"

interface Props {
  code: string
}

export function BetaInvitationContent(props: Props) {
  return (
    <EmailWrapper>
      <Heading className="mb-4">you now have access to the ramble beta!</Heading>
      <p className="mb-4">
        Thank you for signing up! We look forward to working together with you to build the ultimate van life travel app.
      </p>
      <p className="mb-4">
        You are one of the very first members of a growing intimate community built around a shared love and respect for nature
        whilst supporting local communities when traveling.
      </p>
      <p className="mb-4">Use this code when signing up to get access.</p>
      <Container className="border-gray-[rgba(120,120,120,0.9)] rounded-xs mb-4 border border-solid ">
        <div className="p-6">
          <p className="text-center text-4xl">{props.code}</p>
        </div>
      </Container>
      <div className="flex items-center justify-center space-x-4">
        <Link href="https://apps.apple.com/us/app/rumble/id1518427877?itsct=apps_box_badge&amp;itscg=30200">
          <Img
            src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&amp;releaseDate=1595289600"
            alt="Download on the App Store"
            width={200}
            height={80}
          />
        </Link>
        <Link href="http://play.google.com/store/?pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1">
          <Img
            width={250}
            height={100}
            alt="Get it on Google Play"
            src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
          />
        </Link>
      </div>
    </EmailWrapper>
  )
}
export function BetaInvitationEmail(props: Props) {
  return (
    <EmailDocument>
      <BetaInvitationContent {...props} />
    </EmailDocument>
  )
}
