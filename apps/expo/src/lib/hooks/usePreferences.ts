import { z } from "zod"

import AsyncStorage from "@react-native-async-storage/async-storage"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

const preferencesSchema = z.object({
  mapLayer: z.enum(["rain", "temp", "satellite"]).nullable(),
  mapUsers: z.boolean(),
})
export const usePreferences = create<{
  preferences: z.infer<typeof preferencesSchema>
  setPreferences: (preference: Partial<z.infer<typeof preferencesSchema>>) => void
}>()(
  persist(
    (set) => ({
      preferences: { mapLayer: null, mapUsers: true },
      setPreferences: (preference) => set((state) => ({ preferences: { ...state.preferences, ...preference } })),
    }),
    { name: "ramble.preferences", storage: createJSONStorage(() => AsyncStorage) },
  ),
)
