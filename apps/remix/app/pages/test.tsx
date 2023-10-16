import { z } from "~/lib/vendor/zod.server"

import { Form, FormButton, FormField } from "~/components/Form"
import { FormNumber, createAction, createActions } from "~/lib/form.server"
import { json } from "~/lib/remix.server"
import { ActionFunctionArgs } from "~/lib/vendor/vercel.server"

enum Actions {
  first = "first",
  second = "second",
}

export const action = ({ request }: ActionFunctionArgs) => {
  return createActions<Actions>(request, {
    first: createAction(request)
      .input(z.object({ first: FormNumber.min(20) }))
      .handler(async (data) => {
        console.log(data.first)
        return json(data, request, { flash: { title: "First worked!" } })
      }),
    second: createAction(request)
      .input(z.object({ second: z.string() }))
      .handler((data) => {
        console.log(data.second)
        return json(data, request, { flash: { title: "Second worked!" } })
      }),
  })
}

export default function Test() {
  return (
    <div className="mx-auto max-w-5xl p-10">
      <h1 className="brand-header text-4xl">test</h1>
      <div className="grid grid-cols-2 gap-10">
        <Form className="rounded-xs border p-10">
          <FormField name="first" label="A number greater than 20" />
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
