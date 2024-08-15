"use client"

import { Heart } from "lucide-react"
import { AppCta } from "./AppCta"
import { IconButton, Popover, PopoverContent, PopoverPortal, PopoverTrigger } from "./ui"

export function SaveSpot() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <IconButton
          className="rounded-full bg-background hover:bg-background dark:hover:opacity-80 hover:opacity-90"
          aria-label="save to list"
          icon={<Heart size={16} />}
          onClick={(e) => e.stopPropagation()}
        />
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent>
          <AppCta message="Download the app to add this spot to a list or trip" />
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  )
}
