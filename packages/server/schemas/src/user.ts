import { z } from "zod"

import { NullableFormString } from "./utils/form"

export const userSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z
    .string()
    .email()
    .min(2)
    .transform((e) => e.toLowerCase().trim()),
  password: z.string().min(8),
  username: z
    .string()
    .min(2)
    .transform((e) => e.toLowerCase().trim())
    .refine((username) => !username.trim().includes(" "), "Username can not contain empty spaces"),
  preferredLanguage: z.string().optional(),
  bio: NullableFormString,
  instagram: NullableFormString,
  avatar: NullableFormString,
  isClimber: z.boolean().optional(),
  isSurfer: z.boolean().optional(),
  isPaddleBoarder: z.boolean().optional(),
  isHiker: z.boolean().optional(),
  isPetOwner: z.boolean().optional(),
  isLocationPrivate: z.boolean().optional(),
  isMountainBiker: z.boolean().optional(),
  isYogi: z.boolean().optional(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
  tripSyncEnabled: z.boolean().optional(),
  tripSyncOnNetworkEnabled: z.boolean().optional(),
})

export const registerSchema = userSchema
  .pick({ email: true, password: true, username: true, firstName: true, lastName: true })
  .extend({ code: z.string().transform((e) => e.toUpperCase().trim()) })
