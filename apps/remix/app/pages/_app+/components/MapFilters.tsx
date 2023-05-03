import { Settings2 } from "lucide-react"
import queryString from "query-string"

import type { SpotType } from "@travel/database"
import { useDisclosure } from "@travel/shared"
import { Button, Checkbox, Modal, ModalFooter, Select } from "@travel/ui"

const SPOT_OPTIONS: { label: string; value: SpotType }[] = [
  { label: "Cafe", value: "CAFE" },
  { label: "Restaurant", value: "RESTAURANT" },
  { label: "Camping", value: "CAMPING" },
  { label: "Parking", value: "PARKING" },
  { label: "Bar", value: "BAR" },
  { label: "Tip", value: "TIP" },
  { label: "Shop", value: "SHOP" },
  { label: "Climbing", value: "CLIMBING" },
  { label: "Mountain Biking", value: "MOUNTAIN_BIKING" },
  { label: "Gas Station", value: "GAS_STATION" },
  { label: "SUPing", value: "SUPPING" },
  { label: "Other", value: "OTHER" },
]

export function MapFilters({ onChange }: { onChange: (params: string) => void }) {
  const onSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault()
    const values = Object.fromEntries(new FormData(e.target as HTMLFormElement))
    const existingParams = queryString.parse(window.location.search)
    const newParams = queryString.stringify({
      ...existingParams,
      type: values.type || undefined,
      isPetFriendly: values.isPetFriendly || undefined,
    })
    onChange(newParams)
    modalProps.onClose()
  }
  const modalProps = useDisclosure()
  return (
    <>
      <Button
        onClick={modalProps.onOpen}
        variant="outline"
        className="hover:bg-gray-75 absolute left-1/2 top-4 -translate-x-1/2 bg-white active:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:active:bg-gray-600"
        leftIcon={<Settings2 className="sq-4" />}
        aria-label="filters"
      >
        Filters
      </Button>
      <Modal {...modalProps} title="Filters">
        <form className="space-y-2" onSubmit={onSubmit}>
          <label htmlFor="isPetFriendly" className="flex space-x-4">
            <Checkbox
              name="isPetFriendly"
              id="isPetFriendly"
              defaultChecked={Boolean(queryString.parse(window.location.search).isPetFriendly)}
              className="mt-1"
            />
            <div>
              <p>Pet friendly</p>
              <p className="text-sm opacity-70">Furry friends allowed!</p>
            </div>
          </label>

          <Select
            name="type"
            defaultValue={(queryString.parse(window.location.search).type as string) || ""}
            className="cursor-pointer"
          >
            <option value="">All</option>
            {SPOT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
          <ModalFooter>
            <Button type="submit">Save filters</Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  )
}
