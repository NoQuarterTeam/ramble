import { z } from "zod"

export const NullableFormString = z.preprocess((v) => (v === "" ? null : v), z.string().nullish())
