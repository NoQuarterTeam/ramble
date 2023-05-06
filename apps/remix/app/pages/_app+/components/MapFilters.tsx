import type { LucideIcon } from "lucide-react"
import {
  Beer,
  Bike,
  Coffee,
  Dog,
  Fuel,
  HelpCircle,
  Info,
  Mountain,
  ParkingCircle,
  Settings2,
  ShoppingCart,
  Tent,
  Utensils,
  Verified,
  Waves,
} from "lucide-react"
import queryString from "query-string"
import * as React from "react"

import type { SpotType } from "@travel/database"
import { useDisclosure } from "@travel/shared"
import { Button, Modal, ModalFooter, Switch } from "@travel/ui"

type SpotOption = { label: string; value: SpotType; Icon: LucideIcon }
const SPOT_OPTIONS: SpotOption[] = [
  { label: "Cafe", value: "CAFE", Icon: Coffee },
  { label: "Restaurant", value: "RESTAURANT", Icon: Utensils },
  { label: "Camping", value: "CAMPING", Icon: Tent },
  { label: "Parking", value: "PARKING", Icon: ParkingCircle },
  { label: "Bar", value: "BAR", Icon: Beer },
  { label: "Tip", value: "TIP", Icon: Info },
  { label: "Shop", value: "SHOP", Icon: ShoppingCart },
  { label: "Climbing", value: "CLIMBING", Icon: Mountain },
  { label: "Mountain Biking", value: "MOUNTAIN_BIKING", Icon: Bike },
  { label: "Gas Station", value: "GAS_STATION", Icon: Fuel },
  { label: "SUPing", value: "SUPPING", Icon: Waves },
  { label: "Other", value: "OTHER", Icon: HelpCircle },
]

export function MapFilters({ onChange }: { onChange: (params: string) => void }) {
  const onSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const type = formData.getAll("type[]")
    const values = Object.fromEntries(formData)
    const existingParams = queryString.parse(window.location.search, { arrayFormat: "bracket" })
    const newParams = queryString.stringify(
      {
        ...existingParams,
        type: type || undefined,
        isPetFriendly: values.isPetFriendly || undefined,
      },
      { arrayFormat: "bracket" },
    )
    onChange(newParams)
    modalProps.onClose()
  }
  const modalProps = useDisclosure()

  return (
    <>
      <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-md bg-white dark:bg-gray-800">
        <Button onClick={modalProps.onOpen} variant="outline" leftIcon={<Settings2 className="sq-4" />} aria-label="filters">
          Filters
        </Button>
      </div>
      <Modal {...modalProps} size="3xl" title="Filters">
        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="space-y-4">
            <p className="text-xl">Spot type</p>
            <div className="flex flex-wrap gap-2">
              {SPOT_OPTIONS.map((type) => (
                <SpotTypeSelector
                  key={type.value}
                  type={type}
                  defaultValue={Boolean(
                    queryString.parse(window.location.search, { arrayFormat: "bracket" }).type?.includes(type.value),
                  )}
                />
              ))}
            </div>
          </div>
          <hr />
          <div className="space-y-4">
            <p className="text-xl">Options</p>

            <label htmlFor="isVerified" className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <Verified className="sq-6" />
                <div>
                  <p>Verified spots</p>
                  <p className="text-sm opacity-70">Spots that have been verified by an Ambassador</p>
                </div>
              </div>
              <Switch
                name="isVerified"
                id="isVerified"
                defaultChecked={Boolean(queryString.parse(window.location.search).isVerified)}
                className="mt-1"
              />
            </label>
            <label htmlFor="isPetFriendly" className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <Dog className="sq-6" />
                <div>
                  <p>Pet friendly</p>
                  <p className="text-sm opacity-70">Furry friends allowed!</p>
                </div>
              </div>
              <Switch
                name="isPetFriendly"
                id="isPetFriendly"
                defaultChecked={Boolean(queryString.parse(window.location.search).isPetFriendly)}
                className="mt-1"
              />
            </label>
          </div>

          <ModalFooter>
            <Button size="lg" type="submit">
              Save filters
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  )
}

function SpotTypeSelector({ type, defaultValue }: { type: SpotOption; defaultValue: boolean }) {
  const [isSelected, setIsSelected] = React.useState(defaultValue)
  return (
    <>
      <Button
        variant={isSelected ? "primary" : "outline"}
        type="button"
        size="lg"
        leftIcon={<type.Icon className="sq-4" />}
        onClick={() => setIsSelected((s) => !s)}
      >
        {type.label}
      </Button>
      {isSelected && <input type="hidden" name="type[]" value={type.value} />}
    </>
  )
}
