"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { PauseIcon, PlayIcon, DownloadIcon } from "lucide-react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"

// Register Chart.js components
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend, Filler)

interface DataVisualizationProps {
  dataPoints: number[]
  currentValue: number
}

export default function DataVisualization({ dataPoints, currentValue }: DataVisualizationProps) {
  const [isPaused, setIsPaused] = useState(false)
  const [smoothing, setSmoothing] = useState(0.2)
  const [showArea, setShowArea] = useState(false)

  // Calculate statistics from data points
  const calculateStats = () => {
    if (dataPoints.length === 0) return { min: 0, max: 0, avg: 0 }

    const min = Math.min(...dataPoints)
    const max = Math.max(...dataPoints)
    const sum = dataPoints.reduce((acc, val) => acc + val, 0)
    const avg = sum / dataPoints.length

    return { min, max, avg }
  }

  const stats = calculateStats()

  // Export data as CSV
  const handleExportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + dataPoints.join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "sensor_data.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Chart configuration
  const chartData = {
    labels: dataPoints.map((_, idx) => idx + 1),
    datasets: [
      {
        label: "Sensor Value",
        data: isPaused ? [] : dataPoints,
        fill: showArea,
        backgroundColor: "rgba(8, 145, 178, 0.2)",
        borderColor: "rgb(8, 145, 178)",
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 5,
        tension: smoothing,
        cubicInterpolationMode: "monotone",
      },
      // Add a threshold line for reference
      {
        label: "Grip Threshold",
        data: dataPoints.map(() => 600), // Example threshold value
        fill: false,
        borderColor: "rgba(244, 63, 94, 0.5)",
        borderWidth: 1.5,
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0, // Disable animations for better performance
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 10,
          display: true,
          color: "rgba(100, 116, 139, 0.8)",
          font: {
            size: 10,
          },
        },
        title: {
          display: true,
          text: "Time",
          color: "rgba(100, 116, 139, 0.8)",
          font: {
            size: 12,
            weight: "normal",
          },
        },
      },
      y: {
        beginAtZero: false,
        grid: {
          color: "rgba(226, 232, 240, 0.5)",
          drawBorder: false,
        },
        ticks: {
          color: "rgba(100, 116, 139, 0.8)",
          font: {
            size: 10,
          },
          callback: (value: any) => value.toFixed(0),
        },
        title: {
          display: true,
          text: "Sensor Value",
          color: "rgba(100, 116, 139, 0.8)",
          font: {
            size: 12,
            weight: "normal",
          },
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: "rgba(15, 23, 42, 0.8)",
        titleFont: {
          size: 12,
        },
        bodyFont: {
          size: 11,
        },
        padding: 10,
        cornerRadius: 4,
        displayColors: true,
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${context.parsed.y.toFixed(1)}`,
        },
      },
    },
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <Card className="md:col-span-1 border-t-4 border-t-cyan-500 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-cyan-700 dark:text-cyan-400 flex items-center">
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
            Statistics
          </CardTitle>
          <CardDescription>Real-time sensor data metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 p-4 rounded-lg border border-cyan-200 dark:border-cyan-800">
              <p className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Current Value</p>
              <p className="text-3xl font-bold text-cyan-800 dark:text-cyan-200">{currentValue.toFixed(1)}</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                <div
                  className="bg-cyan-600 h-2.5 rounded-full"
                  style={{ width: `${Math.min(100, (currentValue / 800) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Min</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{stats.min.toFixed(1)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Max</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{stats.max.toFixed(1)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{stats.avg.toFixed(1)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Smoothing</label>
                <span className="text-sm text-muted-foreground">{smoothing.toFixed(1)}</span>
              </div>
              <Slider
                value={[smoothing * 10]}
                min={0}
                max={10}
                step={1}
                onValueChange={(value) => setSmoothing(value[0] / 10)}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Fill Area</label>
              <Switch checked={showArea} onCheckedChange={setShowArea} />
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsPaused(!isPaused)} className="flex-1">
                {isPaused ? <PlayIcon className="h-4 w-4 mr-2" /> : <PauseIcon className="h-4 w-4 mr-2" />}
                {isPaused ? "Resume" : "Pause"}
              </Button>

              <Button variant="outline" size="sm" onClick={handleExportData} className="flex-1">
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle>Sensor Data Visualization</CardTitle>
          <CardDescription>Real-time muscle signal data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] sm:h-[400px]">
            <Line data={chartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
