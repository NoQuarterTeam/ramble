import { Link } from "@remix-run/react"
import { Trash } from "lucide-react"
import { cacheHeader } from "pretty-cache-header"
import { ClientOnly } from "remix-utils/client-only"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Button, IconButton, Input, Select } from "~/components/ui"

export const headers = () => {
  return {
    "Cache-Control": cacheHeader({ maxAge: "1week", sMaxage: "1hour", staleWhileRevalidate: "10mins", public: true }),
  }
}
export default function Calc() {
  return <ClientOnly>{() => <VanElectricityCalculator />}</ClientOnly>
}

export function VanElectricityCalculator() {
  const {
    items,
    addItem,
    sunHours,
    batteryType,
    setBatteryType,
    setSunHours,
    panelWattage,
    setPanelWattage,
    removeItem,
    updateItem,
  } = useCalculator()
  const totalAmpHours = items.reduce((acc, item) => acc + Math.ceil(((item.watts || 0) * (item.hours || 0)) / 12), 0)
  const solarAmpHours = !!sunHours && !!panelWattage && Math.floor((sunHours * panelWattage) / 12)
  return (
    <div className="dark min-h-screen bg-background px-3 pt-10 font-serif text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <Link to="/" className="inline-block text-center">
          <p className="brand-header text-5xl">ramble</p>
          <p className="font-semibold text-lg">VAN TRAVEL APP</p>
        </Link>

        <div>
          <h1 className="text-4xl">Van electricity calculator</h1>
          <p className="text-lg">This tool will help you calculate how much electricity you need to power your van in day.</p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="relative col-span-8 w-full space-y-2 overflow-auto">
            <table className="w-full caption-bottom rounded-sm border text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b">
                  <th className="h-12 px-3 text-left align-middle font-medium">Appliance</th>
                  <th className="h-12 px-3 text-left align-middle font-medium">Hours per day</th>
                  <th className="h-12 px-3 text-left align-middle font-medium">Wattage</th>
                  <th className="h-12 whitespace-nowrap px-3 text-left align-middle font-medium">Fuse size required</th>
                  <th className="h-12 px-3 align-middle" />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-3 align-middle">
                      <Input
                        className="pl-2"
                        value={item.name || ""}
                        autoFocus
                        onChange={(e) => {
                          updateItem({ ...item, name: e.target.value })
                        }}
                      />
                    </td>
                    <td className="p-3 align-middle">
                      <Input
                        className="pl-2"
                        value={item.hours || ""}
                        max={24}
                        min={0}
                        type="number"
                        onChange={(e) => {
                          updateItem({ ...item, hours: Number(e.target.value) })
                        }}
                      />
                    </td>
                    <td className="p-3 align-middle">
                      <Input
                        className="pl-2"
                        value={item.watts || ""}
                        min={0}
                        type="number"
                        onChange={(e) => {
                          updateItem({ ...item, watts: Number(e.target.value) })
                        }}
                      />
                    </td>
                    <td className="p-3 text-center align-middle">
                      {item.watts && `${Math.ceil((item.watts / 12) * 1.25)} amps`}
                    </td>
                    <td className="p-3 align-middle">
                      <IconButton
                        variant="ghost"
                        onClick={() => removeItem(item.id)}
                        aria-label="remove item"
                        icon={<Trash size={12} />}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5}>
                    <div className="flex space-x-2 p-3">
                      <Button
                        size="sm"
                        onClick={() => addItem({ id: new Date().getMilliseconds(), name: null, hours: null, watts: null })}
                      >
                        Add appliance
                      </Button>
                      <Select
                        size="sm"
                        variant="solid"
                        onChange={(e) => {
                          const item = ITEM_PRESETS.find((i) => i.id === Number(e.target.value))
                          if (item) {
                            addItem({ ...item, id: new Date().getMilliseconds() })
                            e.currentTarget.value = ""
                            e.currentTarget.blur()
                          }
                        }}
                      >
                        <option value="">Add from preset</option>
                        {ITEM_PRESETS.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="col-span-4 space-y-6">
            <div className="space-y-2 rounded-sm border p-3">
              <p className="font-bold">Input</p>
              <div className="flex justify-between space-x-2">
                <p>Hours of sun</p>
                <Input
                  value={sunHours || ""}
                  min={0}
                  max={24}
                  onChange={(e) => setSunHours(Number(e.target.value))}
                  className="pl-2"
                  type="number"
                />
              </div>
              <div className="flex justify-between space-x-2">
                <p>Solar panel wattage</p>
                <Input
                  min={0}
                  max={100000}
                  value={panelWattage || ""}
                  onChange={(e) => setPanelWattage(Number(e.target.value))}
                  className="pl-2"
                  type="number"
                />
              </div>
            </div>
            <div className="space-y-2 rounded-sm border p-3">
              <p className="font-bold">Output</p>

              {!!totalAmpHours && (
                <div className="flex justify-between space-x-2">
                  <p>Total amphours used per day</p>
                  <p>{`${totalAmpHours} Ah`}</p>
                </div>
              )}
              {!!solarAmpHours && (
                <div className="flex justify-between space-x-2">
                  <p>Total amphours from solar</p>
                  <p>{`${solarAmpHours} Ah`}</p>
                </div>
              )}
              <div className="flex justify-between space-x-2">
                <p>Battery type</p>
                <Select size="xs" value={batteryType} onChange={(e) => setBatteryType(e.target.value as BatteryType)}>
                  {BATTERY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex justify-between space-x-2 border-t pt-2">
                <div className="flex items-center space-x-1">
                  <p>Required battery size</p>
                </div>
                <p>
                  {!!totalAmpHours &&
                    `${Math.max(totalAmpHours * (batteryType === "lead-acid" ? 2 : 1) - (solarAmpHours || 0), totalAmpHours)} Ah`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

type Item = {
  id: number
  name: string | null
  hours: number | null
  watts: number | null
}

type BatteryType = "lead-acid" | "lithium"
export const useCalculator = create<{
  sunHours: number
  setSunHours: (value: number) => void

  panelWattage: number | null
  setPanelWattage: (value: number | null) => void

  batteryType: BatteryType
  setBatteryType: (value: BatteryType) => void

  items: Item[]
  addItem: (item: Item) => void
  updateItem: (item: Item) => void
  removeItem: (id: Item["id"]) => void
}>()(
  persist(
    (set) => ({
      sunHours: 6,
      setSunHours: (value) => set(() => ({ sunHours: value })),
      panelWattage: null,
      setPanelWattage: (value) => set(() => ({ panelWattage: value })),

      batteryType: "lead-acid",
      setBatteryType: (value) => set(() => ({ batteryType: value })),

      items: [],
      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
      updateItem: (item) => set((state) => ({ items: state.items.map((i) => (i.id === item.id ? item : i)) })),
      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
    }),
    { name: "ramble.calculator.electricity" },
  ),
)

const BATTERY_TYPES = [
  { value: "lead-acid", label: "Lead acid" },
  { value: "lithium", label: "Lithium" },
]

const ITEM_PRESETS: Item[] = [
  {
    id: 1,
    name: "LED lights",
    hours: 5,
    watts: 10,
  },
  {
    id: 2,
    name: "Laptop",
    hours: 4,
    watts: 100,
  },
  {
    id: 3,
    name: "Phone",
    hours: 2,
    watts: 10,
  },
  {
    id: 4,
    name: "Fridge",
    hours: 24,
    watts: 100,
  },
  {
    id: 5,
    name: "Fan",
    hours: 12,
    watts: 50,
  },
  {
    id: 6,
    name: "Water pump",
    hours: 1,
    watts: 100,
  },
  {
    id: 7,
    name: "Inverter",
    hours: 1,
    watts: 100,
  },
  {
    id: 8,
    name: "TV",
    hours: 2,
    watts: 100,
  },
  {
    id: 9,
    name: "Microwave",
    hours: 1,
    watts: 1000,
  },
  {
    id: 10,
    name: "Coffee machine",
    hours: 1,
    watts: 1000,
  },
  {
    id: 11,
    name: "Toaster",
    hours: 1,
    watts: 1000,
  },
  {
    id: 12,
    name: "Hair dryer",
    hours: 1,
    watts: 1000,
  },
  {
    id: 13,
    name: "Kettle",
    hours: 1,
    watts: 1000,
  },
  {
    id: 14,
    name: "Electric blanket",
    hours: 1,
    watts: 100,
  },
  {
    id: 15,
    name: "Heater",
    hours: 1,
    watts: 1000,
  },
]
