import type { Metadata } from "next"
import RehabDashboard from "@/components/rehab-dashboard"

export const metadata: Metadata = {
  title: "Prosthetic Arm Rehabilitation",
  description: "Training interface for prosthetic arm users",
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <RehabDashboard />
    </main>
  )
}
