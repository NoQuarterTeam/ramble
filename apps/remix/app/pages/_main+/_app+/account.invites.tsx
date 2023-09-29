import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { Copy } from "lucide-react"

import { generateInviteCodes } from "@ramble/api"
import { createImageUrl } from "@ramble/shared"

import { Form, FormButton } from "~/components/Form"
import { Avatar, Badge, Button } from "~/components/ui"
import { db } from "~/lib/db.server"
import { useClipboard } from "~/lib/hooks/useClipboard"
import { useConfig } from "~/lib/hooks/useConfig"
import { redirect } from "~/lib/remix.server"
import { getCurrentUser } from "~/services/auth/auth.server"

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getCurrentUser(request, {
    role: true,
    isAdmin: true,
    myInviteCodes: { orderBy: { createdAt: "desc" }, include: { user: true } },
  })
  return json(user)
}

export const action = async ({ request }: ActionArgs) => {
  const user = await getCurrentUser(request)
  if (!user.isAdmin) return redirect("/account/invite", request, { flash: { title: "You are not an admin" } })

  const codes = generateInviteCodes(user.id)

  await db.inviteCode.createMany({ data: codes.map((code) => ({ code, ownerId: user.id })) })

  return redirect("/account/invite", request, { flash: { title: "Generated new codes" } })
}

export default function AccountInvite() {
  const user = useLoaderData<typeof loader>()
  return (
    <div className="space-y-2">
      <h1 className="text-3xl">Invites</h1>
      <p>
        For the moment we are invite only, each new user gets 10 invite codes, share them with people who you think would like the
        app! We will create more invite codes soon.
      </p>
      {user.myInviteCodes.map((inviteCode) => (
        <div key={inviteCode.id} className="flex h-8 items-center justify-between">
          <Badge className="font-mono">{inviteCode.code}</Badge>
          {inviteCode.user ? (
            <Link to={`/${inviteCode.user.username}`} className="flex items-center space-x-2 hover:opacity-70">
              <Avatar
                size={40}
                className="sq-6"
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
      {user.isAdmin && (
        <Form className="flex items-center gap-2 rounded py-4">
          <FormButton>Generate new codes</FormButton>
          <p>Only admins see this</p>
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
    <Button leftIcon={!isCopied && <Copy size={16} />} variant="outline" onClick={copy} size="sm">
      {isCopied ? "Copied!" : "Copy invite link"}
    </Button>
  )
}
