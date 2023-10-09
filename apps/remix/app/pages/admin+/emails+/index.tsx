import { Mail } from "lucide-react"

export default function Index() {
  return (
    <div className="center pt-10">
      <div className="vstack rounded-xs border p-8">
        <div>
          <Mail size={30} strokeWidth={1} />
        </div>
        <p>Select an email</p>
      </div>
    </div>
  )
}
