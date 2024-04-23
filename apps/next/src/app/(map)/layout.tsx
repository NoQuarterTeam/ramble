import { MapPage } from "./MapPage"

export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative h-nav-screen w-screen overflow-hidden">
      <MapPage />
      {children}
    </main>
  )
}
