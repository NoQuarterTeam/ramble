import { Link, useSearchParams } from "@remix-run/react"
import { z } from "zod"

import { Form, FormButton, FormError, FormField } from "~/components/Form"
import { track } from "~/lib/analytics.server"
import { db } from "~/lib/db.server"
import { createAction, createActions, formError, NullableFormString } from "~/lib/form.server"
import type { ActionFunctionArgs, MetaFunction } from "~/lib/vendor/vercel.server"
import { redirect } from "~/lib/vendor/vercel.server"
import { comparePasswords } from "~/services/auth/password.server"
import { getUserSession } from "~/services/session/session.server"

// export const config = {
//   // runtime: "edge",
//   // regions: ["fra1", "cdg1", "dub1", "arn1", "lhr1"],
// }

export const meta: MetaFunction = () => {
  return [{ title: "Login" }, { name: "description", content: "Login to the Ramble" }]
}

enum Actions {
  login = "login",
}

export const action = async ({ request }: ActionFunctionArgs) =>
  createActions<Actions>(request, {
    login: () =>
      createAction(request)
        .input(
          z.object({
            email: z.string().min(3).email("Invalid email"),
            password: z.string().min(8, "Must be at least 8 characters"),
            redirectTo: NullableFormString,
          }),
        )
        .handler(async (data) => {
          const user = await db.user.findUnique({ where: { email: data.email } })
          if (!user) return formError({ formError: "Incorrect email or password" })
          const isCorrectPassword = await comparePasswords(data.password, user.password)
          const redirectTo = data.redirectTo
          if (!isCorrectPassword) return formError({ formError: "Incorrect email or password" })

          const { setUser } = await getUserSession(request)
          const headers = new Headers([["set-cookie", await setUser(user.id)]])
          track("Logged in", { userId: user.id })
          return redirect(redirectTo || "/map", { headers })
        }),
  })

export default function Login() {
  const [params] = useSearchParams()
  return (
    <Form className="space-y-2">
      <h1 className="text-4xl">Login</h1>
      <input type="hidden" name="redirectTo" value={params.get("redirectTo") || ""} />
      <FormField required label="Email address" name="email" placeholder="jim@gmail.com" />
      <FormField required label="Password" name="password" type="password" placeholder="********" />
      <div>
        <FormButton value={Actions.login} className="w-full">
          Login
        </FormButton>
        <FormError />
      </div>

      <div className="flex justify-between">
        {/* <Link to="/register" className="hover:opacity-70">
          Register
        </Link> */}
        <Link to="/forgot-password" className="hover:opacity-70">
          Forgot password?
        </Link>
      </div>
    </Form>
  )
}
