import { Link, useSearchParams } from "@remix-run/react"

import { NullableFormString, loginSchema } from "@ramble/server-schemas"
import { comparePasswords } from "@ramble/server-services"

import { Form, FormButton, FormError, FormField } from "~/components/Form"

import { db } from "~/lib/db.server"
import { createAction, createActions, formError } from "~/lib/form.server"
import type { ActionFunctionArgs, MetaFunction } from "~/lib/vendor/vercel.server"
import { redirect } from "~/lib/vendor/vercel.server"
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
        .input(loginSchema.extend({ redirectTo: NullableFormString }))
        .handler(async (data) => {
          const user = await db.user.findUnique({ where: { email: data.email } })
          if (!user) return formError({ formError: "Incorrect email or password" })
          const isCorrectPassword = await comparePasswords(data.password, user.password)
          const redirectTo = data.redirectTo
          if (!isCorrectPassword) return formError({ formError: "Incorrect email or password" })

          const { setUser } = await getUserSession(request)
          const headers = new Headers([["set-cookie", await setUser(user.id)]])
          return redirect(redirectTo || "/map", { headers })
        }),
  })

export default function Login() {
  const [params] = useSearchParams()
  return (
    <Form className="space-y-2">
      <h1 className="text-4xl">Login</h1>
      <input type="hidden" name="redirectTo" value={params.get("redirectTo") || ""} />
      <FormField required minLength={3} label="Email address" name="email" placeholder="jim@gmail.com" />
      <FormField required minLength={8} label="Password" name="password" type="password" placeholder="********" />
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
