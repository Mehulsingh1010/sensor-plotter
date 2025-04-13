"use client"

import { useState, useEffect, useRef } from "react"
import { io, type Socket } from "socket.io-client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ZapIcon, InfoIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import DataVisualization from "./data-visualization"
import GripTraining from "./grip-training"
import PrecisionTraining from "./precision-training"
import GamesTraining from "./games-training"
import SimulationControls from "./simulation-controls"

const SOCKET_SERVER_URL = "http://localhost:3001"

export default function RehabDashboard() {
  const [isConnected, setIsConnected] = useState(false)
  const [sensorValue, setSensorValue] = useState(0)
  const [dataPoints, setDataPoints] = useState<number[]>([])
  const [useSimulation, setUseSimulation] = useState(false)
  const [simulationActive, setSimulationActive] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const { toast } = useToast()

  // Connect to socket server
  useEffect(() => {
    if (!useSimulation) {
      socketRef.current = io(SOCKET_SERVER_URL)

      socketRef.current.on("connect", () => {
        setIsConnected(true)
        toast({
          title: "Connected to sensor",
          description: "Successfully connected to the prosthetic arm sensor.",
        })
      })

      socketRef.current.on("disconnect", () => {
        setIsConnected(false)
        toast({
          title: "Disconnected from sensor",
          description: "Connection to the prosthetic arm sensor was lost.",
          variant: "destructive",
        })
      })

      socketRef.current.on("sensorData", (newData: string) => {
        const value = Number.parseFloat(newData)
        if (!isNaN(value)) {
          setSensorValue(value)
          setDataPoints((prev) => {
            const updated = [...prev, value]
            return updated.length > 100 ? updated.slice(-100) : updated
          })
        }
      })

      return () => {
        socketRef.current?.disconnect()
      }
    }
  }, [useSimulation, toast])

  // Simulation mode
  useEffect(() => {
    if (useSimulation && simulationActive) {
      const interval = setInterval(() => {
        // Generate random data that mimics muscle sensor patterns
        // Base value + random noise + occasional "contraction" spikes
        const baseValue = 500
        const noise = Math.random() * 50 - 25
        const isContraction = Math.random() > 0.9
        const contractionValue = isContraction ? Math.random() * 300 + 100 : 0
        const value = baseValue + noise + contractionValue

        setSensorValue(value)
        setDataPoints((prev) => {
          const updated = [...prev, value]
          return updated.length > 100 ? updated.slice(-100) : updated
        })
      }, 50)

      return () => clearInterval(interval)
    }
  }, [useSimulation, simulationActive])

  const toggleSimulation = () => {
    if (isConnected && !useSimulation) {
      socketRef.current?.disconnect()
    }
    setUseSimulation(!useSimulation)
    setSimulationActive(false)
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col gap-6">
        <div className="bg-gradient-to-r from-cyan-700 to-cyan-900 text-white rounded-xl p-4 sm:p-6 mb-6 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Prosthetic Arm Rehabilitation</h1>
              <p className="text-cyan-100 mt-2 text-sm sm:text-base">
                Advanced training interface for prosthetic control mastery
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
              <Badge
                variant="outline"
                className={`px-3 py-1 w-full sm:w-auto text-center ${
                  isConnected || (useSimulation && simulationActive)
                    ? "bg-green-500 hover:bg-green-600 text-white border-green-400"
                    : "bg-red-500 hover:bg-red-600 text-white border-red-400"
                }`}
              >
                <ZapIcon className="w-4 h-4 mr-2" />
                {isConnected
                  ? "Connected to Sensor"
                  : useSimulation && simulationActive
                    ? "Simulation Active"
                    : "Disconnected"}
              </Badge>

              <div className="flex items-center bg-cyan-800/50 rounded-lg px-3 py-1.5 border border-cyan-600 w-full sm:w-auto justify-between">
                <label htmlFor="simulation-mode" className="text-sm text-cyan-50 font-medium">
                  Simulation Mode
                </label>
                <Switch
                  checked={useSimulation}
                  onCheckedChange={toggleSimulation}
                  id="simulation-mode"
                  className="data-[state=checked]:bg-green-500 ml-2"
                />
              </div>
            </div>
          </div>
        </div>

        {useSimulation && <SimulationControls active={simulationActive} setActive={setSimulationActive} />}

        <Tabs defaultValue="visualization" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <TabsTrigger
              value="visualization"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md rounded-lg"
            >
              <div className="flex flex-col items-center py-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mb-1"
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
                <span className="text-xs sm:text-sm whitespace-nowrap">Data</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="grip"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md rounded-lg"
            >
              <div className="flex flex-col items-center py-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mb-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                  <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
                  <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                  <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                </svg>
                <span className="text-xs sm:text-sm whitespace-nowrap">Grip</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="precision"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md rounded-lg"
            >
              <div className="flex flex-col items-center py-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mb-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m15 9-6 6" />
                  <path d="m9 9 6 6" />
                </svg>
                <span className="text-xs sm:text-sm whitespace-nowrap">Precision</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="games"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md rounded-lg"
            >
              <div className="flex flex-col items-center py-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mb-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                  <path d="m8 21 2.1-6.5a5 5 0 0 1-2.1-4 7 7 0 0 1 14 0 5 5 0 0 1-2.1 4L22 21" />
                </svg>
                <span className="text-xs sm:text-sm whitespace-nowrap">Games</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visualization">
            <DataVisualization dataPoints={dataPoints} currentValue={sensorValue} />
          </TabsContent>

          <TabsContent value="grip">
            <GripTraining sensorValue={sensorValue} />
          </TabsContent>

          <TabsContent value="precision">
            <PrecisionTraining sensorValue={sensorValue} />
          </TabsContent>

          <TabsContent value="games">
            <GamesTraining sensorValue={sensorValue} />
          </TabsContent>
        </Tabs>

        <Card className="border-t-4 border-t-cyan-500 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-cyan-700 dark:text-cyan-400">
              <InfoIcon className="w-5 h-5 mr-2" />
              Getting Started
            </CardTitle>
            <CardDescription>How to use the rehabilitation training interface</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div className="bg-cyan-50 dark:bg-cyan-900/30 p-4 rounded-lg border border-cyan-100 dark:border-cyan-800">
                <p className="text-cyan-800 dark:text-cyan-100">
                  This rehabilitation interface helps you learn how to control your prosthetic arm using muscle signals
                  from your forearm. The sensor detects electrical signals when you contract muscles in your forearm,
                  which are then used to control the prosthetic arm.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold mb-3 flex items-center text-gray-800 dark:text-gray-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-cyan-600 dark:text-cyan-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                      <path d="M9 15v-2" />
                      <path d="M12 15v-6" />
                      <path d="M15 15v-4" />
                    </svg>
                    Training Modes
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <div className="bg-cyan-100 dark:bg-cyan-800/30 p-1 rounded-full mr-2 mt-0.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-cyan-700 dark:text-cyan-300"
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
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">Data Visualization:</span>
                        <span className="text-gray-600 dark:text-gray-300"> See your muscle signals in real-time</span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-cyan-100 dark:bg-cyan-800/30 p-1 rounded-full mr-2 mt-0.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-cyan-700 dark:text-cyan-300"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                          <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
                          <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                          <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                        </svg>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">Grip Training:</span>
                        <span className="text-gray-600 dark:text-gray-300">
                          {" "}
                          Practice basic opening and closing movements
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-cyan-100 dark:bg-cyan-800/30 p-1 rounded-full mr-2 mt-0.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-cyan-700 dark:text-cyan-300"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="m15 9-6 6" />
                          <path d="m9 9 6 6" />
                        </svg>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">Precision Training:</span>
                        <span className="text-gray-600 dark:text-gray-300">
                          {" "}
                          Learn to control the strength of your grip
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-cyan-100 dark:bg-cyan-800/30 p-1 rounded-full mr-2 mt-0.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-cyan-700 dark:text-cyan-300"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                          <path d="m8 21 2.1-6.5a5 5 0 0 1-2.1-4 7 7 0 0 1 14 0 5 5 0 0 1-2.1 4L22 21" />
                        </svg>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">Games:</span>
                        <span className="text-gray-600 dark:text-gray-300">
                          {" "}
                          Fun exercises to improve control and endurance
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold mb-3 flex items-center text-gray-800 dark:text-gray-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-cyan-600 dark:text-cyan-400"
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
                    Tips for Success
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <div className="bg-cyan-100 dark:bg-cyan-800/30 p-1 rounded-full mr-2 mt-0.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-cyan-700 dark:text-cyan-300"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      </div>
                      <span className="text-gray-600 dark:text-gray-300">
                        Start with short training sessions (5-10 minutes)
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-cyan-100 dark:bg-cyan-800/30 p-1 rounded-full mr-2 mt-0.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-cyan-700 dark:text-cyan-300"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                          <line x1="6" y1="1" x2="6" y2="4" />
                          <line x1="10" y1="1" x2="10" y2="4" />
                          <line x1="14" y1="1" x2="14" y2="4" />
                        </svg>
                      </div>
                      <span className="text-gray-600 dark:text-gray-300">
                        Rest between exercises to prevent muscle fatigue
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-cyan-100 dark:bg-cyan-800/30 p-1 rounded-full mr-2 mt-0.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-cyan-700 dark:text-cyan-300"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 5v14" />
                          <path d="M18 13l-6 6" />
                          <path d="M6 13l6 6" />
                        </svg>
                      </div>
                      <span className="text-gray-600 dark:text-gray-300">
                        Focus on consistent, controlled movements
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-cyan-100 dark:bg-cyan-800/30 p-1 rounded-full mr-2 mt-0.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-cyan-700 dark:text-cyan-300"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                          <path d="M21 8h-3a2 2 0 0 0-2 2v3" />
                          <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                          <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
                        </svg>
                      </div>
                      <span className="text-gray-600 dark:text-gray-300">
                        Gradually increase difficulty as you improve
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-cyan-100 dark:bg-cyan-800/30 p-1 rounded-full mr-2 mt-0.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-cyan-700 dark:text-cyan-300"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                          <path d="m9 16 2 2 4-4" />
                        </svg>
                      </div>
                      <span className="text-gray-600 dark:text-gray-300">Practice daily for best results</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
