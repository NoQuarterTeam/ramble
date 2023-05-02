import { useSearchParams } from "@remix-run/react"
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

export function MapFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const type = searchParams.get("type")
  const onSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault()
    const values = Object.fromEntries(new FormData(e.target as HTMLFormElement))
    const existingParams = queryString.parse(searchParams.toString())
    setSearchParams(queryString.stringify({ ...existingParams, ...values }))
    modalProps.onClose()
  }
  const modalProps = useDisclosure()
  return (
    <>
      <Button onClick={modalProps.onOpen} variant="outline" leftIcon={<Settings2 className="sq-4" />} aria-label="filters">
        Filters
      </Button>
      <Modal {...modalProps} title="Filters">
        <form className="space-y-2" onSubmit={onSubmit}>
          <label htmlFor="isPetFriendly" className="flex space-x-4">
            <Checkbox name="isPetFriendly" id="isPetFriendly" className="mt-1" />
            <div>
              <p>Pet friendly</p>
              <p className="text-sm opacity-70">Furry friends allowed!</p>
            </div>
          </label>

          <Select name="type" defaultValue={type || ""} className="cursor-pointer">
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
