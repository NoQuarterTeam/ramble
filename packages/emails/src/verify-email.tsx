import { Button } from "@react-email/button"

import { EmailWrapper } from "./EmailWrapper"

export function VerifyEmail(props: { link?: string }) {
  const link = props.link || "localhost:3000"
  return (
    <EmailWrapper>
      <div>
        <h1 className="text-2xl font-bold text-black">Verify email</h1>
        <p className="mb-4 text-black">Click below to verify your email</p>
        <Button href={link} className="bg-primary-500 mb-4 rounded-md px-3 py-3 text-black">
          Verify
        </Button>
        <a href={link} className="block underline">
          {link}
        </a>
      </div>
    </EmailWrapper>
  )
}
