import AsyncStorage from "@react-native-async-storage/async-storage"
import { type Position } from "@rnmapbox/maps/lib/typescript/src/types/Position"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export const useMapCoords = create<{
  coords: Position | undefined
  setCoords: (coords: Position) => void
}>()(
  persist(
    (set) => ({
      coords: undefined,
      setCoords: (coords) => set({ coords }),
    }),
    { name: "ramble.map.coords", storage: createJSONStorage(() => AsyncStorage) },
  ),
)
