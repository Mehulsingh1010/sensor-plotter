"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { PlayIcon, PauseIcon, RefreshCwIcon, ThumbsUpIcon, HandIcon } from "lucide-react"

interface GripTrainingProps {
  sensorValue: number
}

export default function GripTraining({ sensorValue }: GripTrainingProps) {
  const [threshold, setThreshold] = useState(600)
  const [isGripping, setIsGripping] = useState(false)
  const [exerciseActive, setExerciseActive] = useState(false)
  const [currentExercise, setCurrentExercise] = useState<"open" | "close">("close")
  const [successCount, setSuccessCount] = useState(0)
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [gripPercentage, setGripPercentage] = useState(0)
  const [exerciseTime, setExerciseTime] = useState(30)
  const [timeRemaining, setTimeRemaining] = useState(30)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const handRef = useRef<HTMLDivElement>(null)

  // Calculate grip percentage based on sensor value
  useEffect(() => {
    // Map sensor value to grip percentage (0-100%)
    // Assuming sensor range is approximately 400-800
    const baseValue = 400
    const range = 400
    const normalized = Math.max(0, Math.min(100, ((sensorValue - baseValue) / range) * 100))
    setGripPercentage(normalized)

    // Determine if gripping based on threshold
    setIsGripping(sensorValue > threshold)
  }, [sensorValue, threshold])

  // Exercise timer
  useEffect(() => {
    if (exerciseActive && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining((prev) => prev - 1)
      }, 1000)
    } else if (timeRemaining === 0 && exerciseActive) {
      setExerciseActive(false)
      setTimeRemaining(exerciseTime)
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [exerciseActive, timeRemaining, exerciseTime])

  // Check for successful grip/release based on current exercise
  useEffect(() => {
    if (!exerciseActive) return

    if (currentExercise === "close" && isGripping) {
      setSuccessCount((prev) => prev + 1)
      setTotalAttempts((prev) => prev + 1)
      setCurrentExercise("open")
    } else if (currentExercise === "open" && !isGripping) {
      setSuccessCount((prev) => prev + 1)
      setTotalAttempts((prev) => prev + 1)
      setCurrentExercise("close")
    }
  }, [isGripping, currentExercise, exerciseActive])

  // Start exercise
  const startExercise = () => {
    setExerciseActive(true)
    setTimeRemaining(exerciseTime)
    setSuccessCount(0)
    setTotalAttempts(0)
    setCurrentExercise("close")
  }

  // Reset exercise
  const resetExercise = () => {
    setExerciseActive(false)
    setTimeRemaining(exerciseTime)
    setSuccessCount(0)
    setTotalAttempts(0)
  }

  // Calculate success rate
  const successRate = totalAttempts > 0 ? (successCount / totalAttempts) * 100 : 0

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Grip Training</CardTitle>
          <CardDescription>Practice opening and closing your prosthetic hand</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm sm:text-base">Grip Threshold</span>
                <span className="text-sm text-muted-foreground">{threshold}</span>
              </div>
              <Slider
                value={[threshold]}
                min={400}
                max={800}
                step={10}
                onValueChange={(value) => setThreshold(value[0])}
              />
              <p className="text-xs text-muted-foreground">Adjust the threshold to match your muscle signal strength</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Exercise Duration</span>
                <span className="text-sm text-muted-foreground">{exerciseTime} seconds</span>
              </div>
              <Slider
                value={[exerciseTime]}
                min={10}
                max={60}
                step={5}
                onValueChange={(value) => {
                  setExerciseTime(value[0])
                  if (!exerciseActive) setTimeRemaining(value[0])
                }}
                disabled={exerciseActive}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Current Status</span>
                <Badge variant={isGripping ? "default" : "outline"}>{isGripping ? "Gripping" : "Released"}</Badge>
              </div>
              <Progress value={gripPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">Grip Strength: {gripPercentage.toFixed(0)}%</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Exercise Progress</span>
                <span className="text-sm">{timeRemaining}s remaining</span>
              </div>
              <Progress value={(1 - timeRemaining / exerciseTime) * 100} className="h-2" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Success Rate</p>
                <p className="text-2xl font-bold flex items-center">
                  {successRate.toFixed(0)}%
                  {successRate > 70 && <ThumbsUpIcon className="h-5 w-5 ml-2 text-green-500" />}
                </p>
                <p className="text-xs text-muted-foreground">{successCount} successful transitions</p>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={exerciseActive ? resetExercise : startExercise}
                  variant={exerciseActive ? "destructive" : "default"}
                >
                  {exerciseActive ? (
                    <>
                      <PauseIcon className="h-4 w-4 mr-2" />
                      Stop
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Start Exercise
                    </>
                  )}
                </Button>

                <Button variant="outline" onClick={resetExercise} disabled={!exerciseActive}>
                  <RefreshCwIcon className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visual Feedback</CardTitle>
          <CardDescription>
            {exerciseActive ? (
              <>
                {currentExercise === "close" ? (
                  <span className="font-medium text-green-500">Close your hand now</span>
                ) : (
                  <span className="font-medium text-green-500">Open your hand now</span>
                )}
              </>
            ) : (
              "Start the exercise to begin training"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[400px]">
          <div ref={handRef} className="relative w-64 h-64 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <HandIcon
                className={`w-48 h-48 transition-all duration-300 ${
                  isGripping ? "text-cyan-600 scale-90" : "text-cyan-400 scale-100"
                }`}
              />
            </div>

            {exerciseActive && (
              <div className="absolute bottom-0 left-0 right-0 text-center">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {currentExercise === "close" ? "CLOSE" : "OPEN"}
                </Badge>
              </div>
            )}
          </div>

          {exerciseActive ? (
            <div className="mt-8 text-center">
              <p className="text-lg font-medium">
                {currentExercise === "close" ? "Contract your forearm muscles" : "Relax your forearm muscles"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">Focus on making smooth, controlled transitions</p>
            </div>
          ) : (
            <div className="mt-8 text-center">
              <p className="text-lg font-medium">Press "Start Exercise" to begin</p>
              <p className="text-sm text-muted-foreground mt-2">
                You'll practice opening and closing your prosthetic hand
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
