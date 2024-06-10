import { customAlphabet } from "nanoid"

export const createSpotNanoId = () => {
  const id = customAlphabet("abcdefghjkmnpqrstuvwxyz2345678ABCDEFGHJKLMPQRSTUVXYZ")(8)
  return id
}
