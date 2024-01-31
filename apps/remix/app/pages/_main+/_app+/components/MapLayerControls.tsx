import { CloudRain, Layers, MountainSnow, SunMoon, Thermometer, Users2 } from "lucide-react"
import * as RadioGroup from "@radix-ui/react-radio-group"
import { useDisclosure } from "@ramble/shared"

import { useFetcher } from "~/components/Form"
import { IconButton, Modal, Switch, Tooltip } from "~/components/ui"
import { useMapLayers } from "~/lib/hooks/useMapLayers"
import { ActionDataSuccessResponse } from "~/lib/form.server"

export const mapLayersUrl = "/api/map-layers"

export function MapLayerControls() {
  const modalProps = useDisclosure()
  const mapLayersFetcher = useFetcher<ActionDataSuccessResponse>({
    onFinish: (data) => {
      if (data.success) {
        modalProps.onClose()
      }
    },
  })
  const mapLayers = useMapLayers()

  return (
    <>
      <div className="rounded-xs bg-background absolute right-2 top-2 shadow md:right-4 md:top-4">
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
        <mapLayersFetcher.Form className="space-y-6 px-1" action={mapLayersUrl}>
          <div className="space-y-4">
            <RadioGroup.Root defaultValue={mapLayers.layer || ""} name="layer" className="space-y-2">
              <label
                htmlFor="default"
                className="flex cursor-pointer items-center justify-between rounded-sm border p-4 hover:opacity-90"
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
                  className="focus-visible:ring-ring sq-5 aspect-square rounded-full border shadow focus:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RadioGroup.Indicator className="flex items-center justify-center">
                    <div className="sq-3 bg-primary rounded-full" />
                  </RadioGroup.Indicator>
                </RadioGroup.Item>
              </label>
              <label
                htmlFor="rain"
                className="flex cursor-pointer items-center justify-between rounded-sm border p-4 hover:opacity-90"
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
                  className="focus-visible:ring-ring sq-5 aspect-square rounded-full border shadow focus:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RadioGroup.Indicator className="flex items-center justify-center">
                    <div className="sq-3 bg-primary rounded-full" />
                  </RadioGroup.Indicator>
                </RadioGroup.Item>
              </label>
              <label
                htmlFor="temp"
                className="flex cursor-pointer items-center justify-between rounded-sm border p-4 hover:opacity-90"
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
                  className="focus-visible:ring-ring sq-5 aspect-square rounded-full border shadow focus:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RadioGroup.Indicator className="flex items-center justify-center">
                    <div className="sq-3 bg-primary rounded-full" />
                  </RadioGroup.Indicator>
                </RadioGroup.Item>
              </label>
              <label
                htmlFor="satellite"
                className="flex cursor-pointer items-center justify-between rounded-sm border p-4 hover:opacity-90"
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
                  className="focus-visible:ring-ring sq-5 aspect-square rounded-full border shadow focus:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RadioGroup.Indicator className="flex items-center justify-center">
                    <div className="sq-3 bg-primary rounded-full" />
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
              <Switch name="shouldShowUsers" id="shouldShowUsers" defaultChecked={!!mapLayers.shouldShowUsers} className="mt-1" />
            </label>
          </div>

          <div className="flex w-full justify-between">
            <mapLayersFetcher.FormButton size="lg">Save</mapLayersFetcher.FormButton>
          </div>
        </mapLayersFetcher.Form>
      </Modal>
    </>
  )
}
