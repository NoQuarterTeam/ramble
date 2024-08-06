import { MapPage } from "./MapPage"

export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="relative w-screen overflow-hidden"
      style={{
        height: "calc(100svh - 70px)",
      }}
    >
      <MapPage />
      {children}
    </main>
  )
}
