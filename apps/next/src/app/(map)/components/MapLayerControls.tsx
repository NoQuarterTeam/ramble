import * as RadioGroup from "@radix-ui/react-radio-group"
import { useDisclosure } from "@ramble/shared"
import { CloudRain, Earth, Layers, MountainSnow, SunMoon, Thermometer, Users2 } from "lucide-react"

import { AppCta } from "@/components/AppCta"
import { Button, IconButton, Modal, Switch, Tooltip } from "@/components/ui"

export function MapLayerControls() {
  const modalProps = useDisclosure()

  return (
    <>
      <div className="absolute top-2 right-2 rounded-xs bg-background shadow md:top-4 md:right-4">
        <Tooltip label="Map layers" side="left">
          <IconButton
            onClick={modalProps.onOpen}
            className="border-none"
            variant="ghost"
            icon={<Layers className="sq-5" />}
            aria-label="filters"
          />
        </Tooltip>
      </div>

      <Modal {...modalProps} size="xl" title="Map layers">
        <div className="space-y-4">
          <AppCta />
          <div className="space-y-4">
            <RadioGroup.Root defaultValue={""} name="layer" className="space-y-2">
              <label
                htmlFor="default"
                className="flex cursor-not-allowed items-center justify-between rounded-sm border p-4 hover:opacity-90"
              >
                <div className="flex items-center space-x-4">
                  <SunMoon className="sq-7" />
                  <div>
                    <p>Default</p>
                    <p className="text-sm opacity-70">Shows the default map styling</p>
                  </div>
                </div>
                <RadioGroup.Item
                  value=""
                  id="default"
                  disabled
                  className="sq-5 aspect-square rounded-full border shadow cursor-not-allowed focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <RadioGroup.Indicator className="flex items-center justify-center">
                    <div className="sq-3 rounded-full bg-primary" />
                  </RadioGroup.Indicator>
                </RadioGroup.Item>
              </label>
              <label
                htmlFor="rain"
                className="flex cursor-not-allowed items-center justify-between rounded-sm border p-4 hover:opacity-90"
              >
                <div className="flex items-center space-x-4">
                  <CloudRain className="sq-7" />
                  <div>
                    <p>Rain</p>
                    <p className="text-sm opacity-70">Shows the current rain radar</p>
                  </div>
                </div>
                <RadioGroup.Item
                  value="rain"
                  id="rain"
                  disabled
                  className="sq-5 aspect-square rounded-full border shadow cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <RadioGroup.Indicator className="flex items-center justify-center">
                    <div className="sq-3 rounded-full bg-primary" />
                  </RadioGroup.Indicator>
                </RadioGroup.Item>
              </label>
              <label
                htmlFor="temp"
                className="flex cursor-not-allowed items-center justify-between rounded-sm border p-4 hover:opacity-90"
              >
                <div className="flex items-center space-x-4">
                  <Thermometer className="sq-7" />
                  <div>
                    <p>Temperatue</p>
                    <p className="text-sm opacity-70">Shows the current temperature</p>
                  </div>
                </div>
                <RadioGroup.Item
                  value="temp"
                  id="temp"
                  disabled
                  className="sq-5 aspect-square rounded-full border shadow disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <RadioGroup.Indicator className="flex items-center justify-center">
                    <div className="sq-3 rounded-full bg-primary" />
                  </RadioGroup.Indicator>
                </RadioGroup.Item>
              </label>
              <label
                htmlFor="satellite"
                className="flex cursor-not-allowed items-center justify-between rounded-sm border p-4 hover:opacity-90"
              >
                <div className="flex items-center space-x-4">
                  <MountainSnow className="sq-7" />
                  <div>
                    <p>Satellite</p>
                    <p className="text-sm opacity-70">Changes the map to satellite view</p>
                  </div>
                </div>
                <RadioGroup.Item
                  value="satellite"
                  id="satellite"
                  disabled
                  className="sq-5 aspect-square rounded-full border shadow disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <RadioGroup.Indicator className="flex items-center justify-center">
                    <div className="sq-3 rounded-full bg-primary" />
                  </RadioGroup.Indicator>
                </RadioGroup.Item>
              </label>
              <label
                htmlFor="bioRegions"
                className="flex cursor-not-allowed items-center justify-between rounded-sm border p-4 hover:opacity-90"
              >
                <div className="flex items-center space-x-4">
                  <Earth className="sq-7" />
                  <div>
                    <p>Bio Regions</p>
                    <p className="text-sm opacity-70">Shows bioregions of europe</p>
                  </div>
                </div>
                <RadioGroup.Item
                  value="bioRegions"
                  id="bioRegions"
                  disabled
                  className="sq-5 aspect-square rounded-full border shadow disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <RadioGroup.Indicator className="flex items-center justify-center">
                    <div className="sq-3 rounded-full bg-primary" />
                  </RadioGroup.Indicator>
                </RadioGroup.Item>
              </label>
            </RadioGroup.Root>

            <hr />
            <label htmlFor="shouldShowUsers" className="flex items-center justify-between space-y-1">
              <div className="flex items-center space-x-4">
                <Users2 className="sq-6" />
                <div>
                  <p>Ramble users</p>
                  <p className="text-sm opacity-70"> See the approximate location of other Ramble users</p>
                </div>
              </div>
              <Switch name="shouldShowUsers" id="shouldShowUsers" defaultChecked disabled className="mt-1" />
            </label>
          </div>

          <div className="flex w-full  p-1 justify-between">
            <Button size="lg">Save</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
