import * as React from "react"
import { Dog, Settings2, Verified } from "lucide-react"
import queryString from "query-string"

import { useDisclosure } from "@ramble/shared"

import { Button, IconButton, Modal, Switch, Tooltip } from "~/components/ui"
import { SPOT_TYPE_OPTIONS } from "~/lib/models/spots"

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
        isVerified: values.isVerified || undefined,
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
        isVerified: undefined,
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
      <div className="bg-background rounded-xs absolute left-1/2 top-4 hidden -translate-x-1/2 md:block">
        <Button
          onClick={modalProps.onOpen}
          className="border-none"
          leftIcon={<Settings2 className="sq-4" />}
          aria-label="filters"
        >
          Filters
        </Button>
      </div>
      <div className="bg-background rounded-xs absolute right-2 top-12 block md:hidden">
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
        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="space-y-4">
            <p className="text-xl">Spot type</p>
            <div className="flex flex-wrap gap-2">
              {SPOT_TYPE_OPTIONS.map((type) => (
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
                  <p className="text-sm opacity-70">Spots that have been verified by an Guide</p>
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

          <div className="flex w-full justify-between">
            <Button variant="link" size="lg" onClick={onClear}>
              Clear all
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

function SpotTypeSelector({ type, defaultValue }: { type: (typeof SPOT_TYPE_OPTIONS)[number]; defaultValue: boolean }) {
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
