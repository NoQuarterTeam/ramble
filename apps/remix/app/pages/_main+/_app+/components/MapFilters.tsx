import { BadgeX, Dog, Settings2 } from "lucide-react"
import queryString from "query-string"
import * as React from "react"

import { SpotType } from "@ramble/database/types"
import { SPOT_TYPES, type SpotTypeInfo, useDisclosure } from "@ramble/shared"

import { SpotIcon } from "~/components/SpotIcon"
import { Button, IconButton, Modal, Switch, Tooltip } from "~/components/ui"

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
        type: type ? (type.length === 0 ? "none" : type) : undefined,
        isUnverified: values.isUnverified || undefined,
        isPetFriendly: values.isPetFriendly || undefined,
      },
      { arrayFormat: "bracket" },
    )
    onChange(newParams)
    modalProps.onClose()
  }

  const onClear = () => {
    const existingParams = queryString.parse(window.location.search, { arrayFormat: "bracket" })
    const newParams = queryString.stringify(
      {
        ...existingParams,
        isUnverified: undefined,
        type: undefined,
        isPetFriendly: undefined,
      },
      { arrayFormat: "bracket" },
    )
    onChange(newParams)
    modalProps.onClose()
  }
  const modalProps = useDisclosure()

  return (
    <>
      <div className="-translate-x-1/2 absolute top-4 left-1/2 hidden rounded-xs bg-background md:block">
        <Button
          onClick={modalProps.onOpen}
          className="border-none"
          leftIcon={<Settings2 className="sq-4" />}
          aria-label="filters"
        >
          Filters
        </Button>
      </div>
      <div className="absolute top-12 right-2 block rounded-xs bg-background md:hidden">
        <Tooltip label="Filters" side="left">
          <IconButton
            variant="ghost"
            onClick={modalProps.onOpen}
            className="border-none"
            icon={<Settings2 className="sq-4" />}
            aria-label="filters"
          />
        </Tooltip>
      </div>

      <Modal {...modalProps} size="3xl" title="Filters">
        <form className="max-h-[85svh] space-y-6 px-1" onSubmit={onSubmit}>
          <div className="space-y-4">
            <SpotTypeSection title="Stays" types={[SpotType.CAMPING, SpotType.FREE_CAMPING, SpotType.PARKING]} />
            <SpotTypeSection
              title="Activities"
              types={[
                SpotType.CLIMBING,
                SpotType.SURFING,
                SpotType.PADDLE_KAYAK,
                SpotType.HIKING_TRAIL,
                SpotType.MOUNTAIN_BIKING,
              ]}
            />
            <SpotTypeSection
              title="Services"
              types={[SpotType.GAS_STATION, SpotType.ELECTRIC_CHARGE_POINT, SpotType.MECHANIC_PARTS, SpotType.VET]}
            />
            <SpotTypeSection title="Hospitality" types={[SpotType.CAFE, SpotType.RESTAURANT, SpotType.SHOP, SpotType.BAR]} />
            <SpotTypeSection
              title="Other"
              types={[SpotType.REWILDING, SpotType.NATURE_EDUCATION, SpotType.ART_FILM_PHOTOGRAPHY, SpotType.VOLUNTEERING]}
            />
          </div>
          <hr />
          <div className="space-y-4">
            <p className="text-lg">Options</p>

            <label htmlFor="isUnverified" className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <BadgeX className="sq-6" />
                <div>
                  <p>Unverified spots</p>
                  <p className="text-sm opacity-70">Spots that have not been verified by a Guide</p>
                </div>
              </div>
              <Switch
                name="isUnverified"
                id="isUnverified"
                defaultChecked={Boolean(queryString.parse(window.location.search).isUnverified)}
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

          <div className="flex w-full justify-between">
            <Button variant="outline" size="lg" onClick={onClear}>
              Reset
            </Button>
            <Button size="lg" type="submit">
              Save filters
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

function SpotTypeSection({ title, types }: { title: string; types: SpotType[] }) {
  return (
    <div>
      <p className="text-lg">{title}</p>
      <div className="flex flex-wrap gap-2">
        {types.map((type) => (
          <SpotTypeSelector
            key={type}
            type={SPOT_TYPES[type]}
            defaultValue={Boolean(queryString.parse(window.location.search, { arrayFormat: "bracket" }).type?.includes(type))}
          />
        ))}
      </div>
    </div>
  )
}

function SpotTypeSelector({ type, defaultValue }: { type: SpotTypeInfo; defaultValue: boolean }) {
  const [isSelected, setIsSelected] = React.useState(defaultValue)
  return (
    <div className="relative">
      <Button
        disabled={type.isComingSoon}
        variant={isSelected ? "primary" : "outline"}
        type="button"
        className="min-w-[100px]"
        leftIcon={<SpotIcon type={type.value} className="sq-4" />}
        onClick={() => setIsSelected((s) => !s)}
      >
        {type.label}
      </Button>
      {type.isComingSoon && (
        <p className="-right-1 -top-1 absolute flex items-center justify-center rounded-full border bg-background px-1 text-xxs shadow">
          Coming soon
        </p>
      )}
      {isSelected && !type.isComingSoon && <input type="hidden" name="type[]" value={type.value} />}
    </div>
  )
}
