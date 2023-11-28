import { CloudRain, Layers, MountainSnow, Thermometer, Users2 } from "lucide-react"

import { useDisclosure } from "@ramble/shared"

import { useFetcher } from "~/components/Form"
import { IconButton, Modal, Switch, Tooltip } from "~/components/ui"
import { usePreferences } from "~/lib/hooks/usePreferences"

export const preferencesUrl = "/api/preferences"

export function MapLayerControls() {
  const modalProps = useDisclosure()
  const savePreferencesFetcher = useFetcher({ onFinish: modalProps.onClose })
  const preferences = usePreferences()

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
        {(preferences.mapLayerRain || preferences.mapLayerTemp) && (
          <div className="sq-5 absolute -right-2 -top-2 flex items-center justify-center rounded-full border border-gray-500 bg-white dark:border-white dark:bg-black">
            <p className="text-xs">{+preferences.mapLayerRain + +preferences.mapLayerTemp}</p>
          </div>
        )}
      </div>

      <Modal {...modalProps} size="xl" title="Map layers">
        <savePreferencesFetcher.Form className="space-y-6 px-1" action={preferencesUrl}>
          <div className="space-y-4">
            <label htmlFor="mapLayerRain" className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <CloudRain className="sq-6" />
                <div>
                  <p>Rain</p>
                  <p className="text-sm opacity-70">Shows the current rain radar</p>
                </div>
              </div>
              <Switch name="mapLayerRain" id="mapLayerRain" defaultChecked={preferences.mapLayerRain} className="mt-1" />
            </label>
            <label htmlFor="mapLayerTemp" className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <Thermometer className="sq-6" />
                <div>
                  <p>Temperature</p>
                  <p className="text-sm opacity-70">Shows the current temperature</p>
                </div>
              </div>
              <Switch name="mapLayerTemp" id="mapLayerTemp" defaultChecked={preferences.mapLayerTemp} className="mt-1" />
            </label>
            <label htmlFor="mapStyleSatellite" className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <MountainSnow className="sq-6" />
                <div>
                  <p>Satellite view</p>
                  <p className="text-sm opacity-70">Changes the map to satellite view</p>
                </div>
              </div>
              <Switch
                name="mapStyleSatellite"
                id="mapStyleSatellite"
                defaultChecked={preferences.mapStyleSatellite}
                className="mt-1"
              />
            </label>
            <label htmlFor="mapUsers" className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <Users2 className="sq-6" />
                <div>
                  <p>Ramble users</p>
                  <p className="text-sm opacity-70"> See the approximate location of other Ramble users</p>
                </div>
              </div>
              <Switch name="mapUsers" id="mapUsers" defaultChecked={preferences.mapUsers} className="mt-1" />
            </label>
          </div>

          <div className="flex w-full justify-between">
            <savePreferencesFetcher.FormButton size="lg">Save</savePreferencesFetcher.FormButton>
          </div>
        </savePreferencesFetcher.Form>
      </Modal>
    </>
  )
}
