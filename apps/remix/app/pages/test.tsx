import { type ActionFunctionArgs } from "@vercel/remix"
import { z } from "zod"

import { Form, FormButton } from "~/components/Form"
import { createActions, FormNumber } from "~/lib/form.server"
import { json } from "~/lib/remix.server"

enum Actions {
  first = "first",
  second = "second",
}

export const action = async ({ request }: ActionFunctionArgs) => {
  return createActions<Actions>(request, {
    first: {
      input: z.object({ first: FormNumber }),
      handler: (data) => {
        console.log(data)
        return json(data, request, { flash: { title: "First worked!" } })
      },
    },
    second: {
      input: z.object({ second: z.string() }),
      handler: (data) => {
        console.log(data)
        return json(data, request, { flash: { title: "Second worked!" } })
      },
    },
  })
}
export default function Test() {
  return (
    <div className="mx-auto max-w-5xl p-10">
      <h1 className="brand-header text-4xl">test</h1>
      <div className="grid grid-cols-2 gap-10">
        <Form className="rounded-xs border p-10">
          <input type="hidden" name="first" value="1" />
          <FormButton value={Actions.first}>First</FormButton>
        </Form>
        <Form className="rounded-xs border p-10">
          <input type="hidden" name="second" value="2" />
          <FormButton value={Actions.second}>Second</FormButton>
        </Form>
      </div>
    </div>
  )
}
