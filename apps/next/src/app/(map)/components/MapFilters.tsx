import { BadgeX, Dog, Settings2 } from "lucide-react"
import * as React from "react"

import type { SpotType } from "@ramble/database/types"
import { SPOT_TYPES, type SpotTypeInfo, useDisclosure } from "@ramble/shared"

import { AppCta } from "@/components/AppCta"
import { SpotIcon } from "@/components/SpotIcon"
import { Button, IconButton, Modal, Switch, Tooltip } from "@/components/ui"

export function MapFilters() {
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
        <div className="max-h-[85svh] space-y-6 px-1">
          <AppCta />
          <div className="space-y-4">
            <SpotTypeSection title="Stays" types={["CAMPING", "FREE_CAMPING", "PARKING"]} />
            <SpotTypeSection
              title="Activities"
              types={["CLIMBING", "SURFING", "PADDLE_KAYAK", "HIKING_TRAIL", "MOUNTAIN_BIKING"]}
            />
            <SpotTypeSection title="Services" types={["GAS_STATION", "ELECTRIC_CHARGE_POINT", "MECHANIC_PARTS", "VET"]} />
            <SpotTypeSection title="Hospitality" types={["CAFE", "RESTAURANT", "SHOP", "BAR"]} />
            <SpotTypeSection title="Other" types={["REWILDING", "NATURE_EDUCATION", "ART_FILM_PHOTOGRAPHY", "VOLUNTEERING"]} />
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
              <Switch name="isUnverified" id="isUnverified" disabled defaultChecked={false} className="mt-1" />
            </label>
            <label htmlFor="isPetFriendly" className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <Dog className="sq-6" />
                <div>
                  <p>Pet friendly</p>
                  <p className="text-sm opacity-70">Furry friends allowed!</p>
                </div>
              </div>
              <Switch name="isPetFriendly" id="isPetFriendly" disabled defaultChecked className="mt-1" />
            </label>
          </div>

          <div className="flex w-full pb-1 justify-between">
            <Button variant="outline" size="lg" disabled>
              Reset
            </Button>
            <Button size="lg" onClick={modalProps.onClose}>
              Save filters
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

function SpotTypeSection({ title, types }: { title: string; types: SpotType[] }) {
  const enabledTypes = ["CAMPING", "FREE_CAMPING"]
  return (
    <div>
      <p className="text-lg">{title}</p>
      <div className="flex flex-wrap gap-2">
        {types.map((type) => (
          <SpotTypeSelector key={type} type={SPOT_TYPES[type]} defaultValue={enabledTypes.includes(type)} />
        ))}
      </div>
    </div>
  )
}

function SpotTypeSelector({ type, defaultValue }: { type: SpotTypeInfo; defaultValue: boolean }) {
  const [isSelected] = React.useState(defaultValue)

  return (
    <div className="relative">
      <Button
        disabled
        variant={isSelected ? "primary" : "outline"}
        type="button"
        className="min-w-[100px] pointer-events-none"
        leftIcon={<SpotIcon type={type.value} className="sq-4" />}
      >
        {type.label}
      </Button>
      {type.isComingSoon && (
        <p className="-right-1 -top-1 absolute flex items-center justify-center rounded-full border bg-background px-1 text-xxs shadow">
          Coming soon
        </p>
      )}
      {isSelected && <input type="hidden" name="type[]" value={type.value} />}
    </div>
  )
}
