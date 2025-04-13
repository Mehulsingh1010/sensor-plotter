"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { WrenchIcon } from "lucide-react"
import { useState } from "react"

interface SimulationControlsProps {
  active: boolean
  setActive: (active: boolean) => void
}

export default function SimulationControls({ active, setActive }: SimulationControlsProps) {
  const [patternType, setPatternType] = useState<"random" | "sine" | "steps">("random")
  const [noiseLevel, setNoiseLevel] = useState(20)

  return (
    <Card className="border-t-4 border-t-amber-500 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-amber-700 dark:text-amber-400">
          <WrenchIcon className="w-5 h-5 mr-2" />
          Simulation Controls
        </CardTitle>
        <CardDescription>Configure the simulated sensor data for testing</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
          {/* First control */}
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-center justify-between mb-3">
              <label className="font-medium text-amber-800 dark:text-amber-300 flex items-center text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                <span className="whitespace-nowrap">Simulation Active</span>
              </label>
              <Switch checked={active} onCheckedChange={setActive} className="data-[state=checked]:bg-amber-500" />
            </div>
            <div
              className={`p-3 rounded-md text-center ${active ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"}`}
            >
              Status: {active ? "Running" : "Stopped"}
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-2">
              Toggle to start/stop the simulated data stream
            </p>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <label className="font-medium text-amber-800 dark:text-amber-300 flex items-center mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12h20" />
                <path d="M7 5l-5 7 5 7" />
                <path d="M17 5l5 7-5 7" />
              </svg>
              Noise Level: <span className="ml-1 text-amber-900 dark:text-amber-200">{noiseLevel}%</span>
            </label>
            <Slider
              value={[noiseLevel]}
              min={0}
              max={50}
              step={5}
              onValueChange={(value) => setNoiseLevel(value[0])}
              className="mb-3"
            />
            <div className="grid grid-cols-3 text-center text-xs text-amber-700 dark:text-amber-400">
              <div>Low</div>
              <div>Medium</div>
              <div>High</div>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-2">
              Adjust the randomness of the simulated data
            </p>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <label className="font-medium text-amber-800 dark:text-amber-300 flex items-center mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 3v18h18" />
                <path d="M18 12V8" />
                <path d="M14 12V6" />
                <path d="M10 12v-2" />
                <path d="M6 12v-4" />
              </svg>
              Pattern Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={patternType === "random" ? "default" : "outline"}
                size="sm"
                onClick={() => setPatternType("random")}
                className={patternType === "random" ? "bg-amber-500 hover:bg-amber-600" : ""}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 16.98h-5.99c-1.66 0-3.01-1.34-3.01-3s1.34-3 3.01-3H18" />
                  <path d="M6 7.01V16.98" />
                </svg>
                Random
              </Button>
              <Button
                variant={patternType === "sine" ? "default" : "outline"}
                size="sm"
                onClick={() => setPatternType("sine")}
                className={patternType === "sine" ? "bg-amber-500 hover:bg-amber-600" : ""}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12h4c1.1 0 2-.9 2-2s-.9-2-2-2H3" />
                  <path d="M7 12h4c1.1 0 2 .9 2 2s-.9 2-2 2H7" />
                  <path d="M11 12h4c1.1 0 2-.9 2-2s-.9-2-2-2h-4" />
                  <path d="M15 12h4c1.1 0 2 .9 2 2s-.9 2-2 2h-4" />
                </svg>
                Sine
              </Button>
              <Button
                variant={patternType === "steps" ? "default" : "outline"}
                size="sm"
                onClick={() => setPatternType("steps")}
                className={patternType === "steps" ? "bg-amber-500 hover:bg-amber-600" : ""}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6h-5v12H8" />
                  <path d="M18 18h-5" />
                  <path d="M8 12h5" />
                </svg>
                Steps
              </Button>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-2">
              Select the pattern for the simulated muscle signals
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg border border-amber-200 dark:border-amber-800 flex items-start">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-3 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div>
            <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">Simulation Mode</p>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
              This simulation mode allows you to test the rehabilitation interface without connecting to the actual
              ESP32 hardware. When you're ready to use your prosthetic arm, disable simulation mode and ensure your
              hardware is properly connected.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
