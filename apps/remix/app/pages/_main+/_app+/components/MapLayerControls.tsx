import { CloudRain, Layers, Thermometer } from "lucide-react"

import { useDisclosure } from "@ramble/shared"

import { Button, IconButton, Modal, Switch, Tooltip } from "~/components/ui"
import { useFetcherSubmit } from "~/lib/hooks/useFetcherSubmit"
import { usePreferences } from "~/lib/hooks/usePreferences"
import { preferencesUrl } from "~/pages/api+/preferences"

export function MapLayerControls() {
  const modalProps = useDisclosure()
  const savePreferencesFetcher = useFetcherSubmit({ onSuccess: modalProps.onClose })
  const preferences = usePreferences()

  return (
    <>
      <div className="absolute right-4 top-4 rounded-md bg-white shadow dark:bg-gray-800">
        <Tooltip label="Map layers" side="bottom">
          <IconButton
            onClick={modalProps.onOpen}
            size="lg"
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
        <savePreferencesFetcher.Form method="post" replace className="space-y-6" action={preferencesUrl}>
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
          </div>

          <div className="flex w-full justify-between">
            <Button size="lg" type="submit" isLoading={savePreferencesFetcher.state !== "idle"}>
              Save
            </Button>
          </div>
        </savePreferencesFetcher.Form>
      </Modal>
    </>
  )
}
