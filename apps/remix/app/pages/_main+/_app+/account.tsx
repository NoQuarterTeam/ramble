import type { NavLinkProps } from "@remix-run/react"
import { Outlet, useActionData, useLoaderData } from "@remix-run/react"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "~/lib/vendor/vercel.server"
import { AlertCircle, Settings, ToggleRight, User } from "lucide-react"

import { sendAccountVerificationEmail } from "@ramble/api"
import { createImageUrl, merge } from "@ramble/shared"

import { Form, FormButton } from "~/components/Form"
import { LinkButton } from "~/components/LinkButton"
import { NavLink } from "~/components/NavLink"
import type { RambleIcon } from "~/components/ui"
import { Avatar, Badge, buttonSizeStyles, buttonStyles, Icons } from "~/components/ui"
import { track } from "~/lib/analytics.server"
import { createToken } from "~/lib/jwt.server"
import { json } from "~/lib/remix.server"
import { getCurrentUser } from "~/services/auth/auth.server"

import { PageContainer } from "../../../components/PageContainer"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getCurrentUser(request, {
    firstName: true,
    username: true,
    avatarBlurHash: true,
    isVerified: true,
    role: true,
    lastName: true,
    avatar: true,
  })
  return json(user)
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getCurrentUser(request, { email: true, id: true })
  const token = await createToken({ id: user.id })
  await sendAccountVerificationEmail(user, token)
  track("Account verification requested", { userId: user.id })
  return json({ success: true }, request, {
    flash: { title: "Verification email sent", description: "Please check yout emails to verify your account" },
  })
}

export default function AccountLayout() {
  const user = useLoaderData<typeof loader>()
  const data = useActionData<typeof action>()
  return (
    <PageContainer>
      {!user.isVerified && (
        <div className="border-hover rounded-xs flex items-center justify-between border p-2 pl-4">
          <div className="flex items-center space-x-2">
            <AlertCircle size={16} />
            <p>Your account is not yet verified</p>
          </div>
          <Form>
            <FormButton disabled={!!data?.success} size="sm">
              Send verification email
            </FormButton>
          </Form>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between">
        <div className="flex items-center space-x-2 py-2">
          <Avatar size={100} className="sq-20" placeholder={user.avatarBlurHash} src={createImageUrl(user.avatar)} />
          <div>
            <p className="text-2xl">
              {user.firstName} {user.lastName}
            </p>
            <Badge colorScheme={user.role === "GUIDE" ? "green" : user.role === "OWNER" ? "orange" : "gray"}>{user.role}</Badge>
          </div>
        </div>

        <LinkButton size="sm" variant="outline" to={`/${user.username}`}>
          Go to your public profile
        </LinkButton>
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:gap-10">
        <div className="flex w-auto flex-row space-x-2 space-y-0 overflow-x-scroll p-1 md:w-[350px] md:flex-col md:space-x-0 md:space-y-0.5">
          <AccountLink to="/account" Icon={User} end>
            Account
          </AccountLink>
          <AccountLink to="/account/interests" Icon={ToggleRight} end>
            Interests
          </AccountLink>
          <AccountLink Icon={Icons.Van} to="/account/van">
            My van
          </AccountLink>
          <AccountLink Icon={Settings} to="/account/settings">
            Settings
          </AccountLink>
        </div>
        <div className="w-full">
          <Outlet />
        </div>
      </div>
    </PageContainer>
  )
}

function AccountLink({ Icon, children, ...props }: NavLinkProps & { Icon: RambleIcon; children: React.ReactNode }) {
  return (
    <NavLink
      {...props}
      to={props.to}
      className={({ isActive }) =>
        merge(
          buttonStyles({ size: "md", variant: isActive ? "secondary" : "ghost" }),
          buttonSizeStyles({ size: "md" }),
          "flex w-full items-center justify-start space-x-2 text-left",
        )
      }
    >
      <Icon className="sq-4 opacity-60" />
      <span>{children}</span>
    </NavLink>
  )
}
