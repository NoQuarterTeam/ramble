import * as React from "react"
import { Await, useFetcher } from "@remix-run/react"
import { Languages } from "lucide-react"

import { type Spot } from "@ramble/database/types"
import { join, languages } from "@ramble/shared"

import { Select, Tooltip } from "~/components/ui"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { type TranslateSpot } from "~/pages/api+/spots+/$id.translate.$lang"

interface Props {
  spot: Pick<Spot, "id" | "description">
  hash: string | undefined
  translatedDescription: Promise<TranslateSpot> | TranslateSpot | undefined
}

export function TranslateSpotDescription(props: Props) {
  const descriptionFetcher = useFetcher<TranslateSpot>()
  const user = useMaybeUser()
  if (!props.spot.description) return null
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Description</h3>

        <div className="flex items-center gap-2">
          <Tooltip label="Default language can be changed in your settings">
            <Languages size={18} />
          </Tooltip>
          {user ? (
            <Select
              key={user?.preferredLanguage || "en"}
              defaultValue={user?.preferredLanguage || "en"}
              size="sm"
              disabled={!!!user}
              onChange={(e) => {
                descriptionFetcher.load(`/api/spots/${props.spot.id}/translate/${e.target.value}?hash=${props.hash}`)
              }}
            >
              <option value="" disabled>
                Translate
              </option>
              {languages.map((lang) => (
                <option value={lang.code} key={lang.code}>
                  {lang.name}
                </option>
              ))}
            </Select>
          ) : (
            <Select disabled>
              <option value="" disabled>
                Translate
              </option>
            </Select>
          )}
        </div>
      </div>
      {descriptionFetcher.data ? (
        <p className={join("whitespace-pre-wrap", descriptionFetcher.state === "loading" && "animate-pulse-fast")}>
          {descriptionFetcher.data}
        </p>
      ) : (
        <React.Suspense fallback={<div className="h-40" />}>
          <Await resolve={props.translatedDescription}>
            {(val) => (
              <p className={join("whitespace-pre-wrap", descriptionFetcher.state === "loading" && "animate-pulse-fast")}>{val}</p>
            )}
          </Await>
        </React.Suspense>
      )}
    </div>
  )
}
