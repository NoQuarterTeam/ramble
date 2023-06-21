import { z } from "zod"

export const userSchema = z.object({
  email: z.string().email().min(2),
  password: z.string().min(2),
  username: z.string().min(2),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  avatar: z.string().nullish(),
  isClimber: z.boolean(),
  isPaddleBoarder: z.boolean(),
  isHiker: z.boolean(),
  isPetOwner: z.boolean(),
  isMountainBiker: z.boolean(),
})
export const loginSchema = userSchema.pick({ email: true, password: true })
export const registerSchema = userSchema.pick({ email: true, password: true, username: true, firstName: true, lastName: true })
export const updateSchema = userSchema.partial()
