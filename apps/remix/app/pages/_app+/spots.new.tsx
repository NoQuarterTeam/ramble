import type { ActionArgs, LinksFunction, LoaderArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { redirect } from "@vercel/remix"
import mapStyles from "mapbox-gl/dist/mapbox-gl.css"
import { db } from "~/lib/db.server"
import { formError, validateFormData } from "~/lib/form"
import { requireUser } from "~/services/auth/auth.server"
import { SpotForm, spotSchema } from "./components/SpotForm"

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: mapStyles }]
}

export const loader = async ({ request }: LoaderArgs) => {
  await requireUser(request)
  return json(null)
}

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUser(request)
  const formData = await request.formData()

  const result = await validateFormData(formData, spotSchema)

  const images = (formData.getAll("image") as string[]).filter(Boolean)

  if (!result.success) return formError(result)

  const { customAddress, ...data } = result.data
  const spot = await db.spot.create({
    data: {
      creator: { connect: { id: userId } },
      ...data,
      images: { create: images.map((image) => ({ path: image, creator: { connect: { id: userId } } })) },
      address: customAddress ?? data.address,
    },
  })

  return redirect(`/spots/${spot.id}`)
}

export default function NewSpot() {
  return <SpotForm />
}
