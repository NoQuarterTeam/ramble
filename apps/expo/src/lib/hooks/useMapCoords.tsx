import { INITIAL_LATITUDE, INITIAL_LONGITUDE } from "@ramble/shared"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { type Position } from "@rnmapbox/maps/lib/typescript/src/types/Position"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export const useMapCoords = create<{
  coords: Position
  setCoords: (coords: Position) => void
}>()(
  persist(
    (set) => ({
      coords: [INITIAL_LONGITUDE, INITIAL_LATITUDE],
      setCoords: (coords) => set({ coords }),
    }),
    { name: "ramble.map.coords", storage: createJSONStorage(() => AsyncStorage) },
  ),
)
