import { Outlet } from "@remix-run/react"

import { buttonSizeStyles, buttonStyles } from "@travel/ui"

import { NavLink } from "~/components/NavLink"

export default function ProfileLayout() {
  return (
    <div className="max-w-screen-limiter mx-auto p-4 md:px-20">
      <div className="flex space-x-2">
        <NavLink
          to="/profile"
          end
          className={({ isActive }) => buttonStyles({ className: buttonSizeStyles(), variant: isActive ? "primary" : "outline" })}
        >
          Profile
        </NavLink>
        <NavLink
          to="/profile/van"
          className={({ isActive }) => buttonStyles({ className: buttonSizeStyles(), variant: isActive ? "primary" : "outline" })}
        >
          My van
        </NavLink>
        <NavLink
          to="/profile/settings"
          className={({ isActive }) => buttonStyles({ className: buttonSizeStyles(), variant: isActive ? "primary" : "outline" })}
        >
          Settings
        </NavLink>
      </div>
      <Outlet />
    </div>
  )
}
