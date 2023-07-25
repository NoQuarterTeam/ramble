import { generateInviteCodes } from "@ramble/api"
import { createImageUrl } from "@ramble/shared"
import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { Form, FormButton } from "~/components/Form"
import { Avatar, Button } from "~/components/ui"
import { db } from "~/lib/db.server"
import { useClipboard } from "~/lib/hooks/useClipboard"
import { useConfig } from "~/lib/hooks/useConfig"

import { redirect } from "~/lib/remix.server"
import { getCurrentUser, requireUser } from "~/services/auth/auth.server"

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getCurrentUser(request, { role: true, myInviteCodes: { include: { user: true } } })
  return json(user)
}

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUser(request)
  const codes = generateInviteCodes(userId)

  await db.inviteCode.createMany({ data: codes.map((code) => ({ code, ownerId: userId })) })

  return redirect("/account/invite", request, { flash: { title: "Generated new codes" } })
}

export default function AccountInvite() {
  const user = useLoaderData<typeof loader>()
  return (
    <div className="space-y-2">
      <h1 className="text-3xl">Invites</h1>
      <p>
        For the moment we are invite only, each new user gets 10 invite codes, share them with people who you think would like the
        app!
      </p>
      {user.myInviteCodes.map((inviteCode) => (
        <div key={inviteCode.id} className="flex h-10 items-center justify-between">
          <p className="text-lg font-medium">{inviteCode.code}</p>
          {inviteCode.user ? (
            <Link to={`/${inviteCode.user.username}`} className="flex items-center space-x-2 hover:opacity-70">
              <Avatar
                size={40}
                className="sq-8"
                src={createImageUrl(inviteCode.user.avatar)}
                placeholder={inviteCode.user.avatarBlurHash}
              />
              <p>{inviteCode.user.firstName}</p>
            </Link>
          ) : (
            <InviteCodeButton code={inviteCode.code} />
          )}
        </div>
      ))}
      {user.role === "ADMIN" && (
        <Form>
          <p>Only admins see this</p>
          <FormButton>Generate new codes</FormButton>
        </Form>
      )}
    </div>
  )
}

function InviteCodeButton(props: { code: string }) {
  const config = useConfig()
  const link = config.WEB_URL + "/register?code=" + props.code
  const [isCopied, copy] = useClipboard(link)
  return (
    <Button variant="outline" onClick={copy}>
      {isCopied ? "Copied!" : "Copy invite link"}
    </Button>
  )
}
