"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { PlayIcon, PauseIcon, RefreshCwIcon, CheckCircle2Icon, XCircleIcon } from "lucide-react"

interface PrecisionTrainingProps {
  sensorValue: number
}

export default function PrecisionTraining({ sensorValue }: PrecisionTrainingProps) {
  const [exerciseActive, setExerciseActive] = useState(false)
  const [targetLevel, setTargetLevel] = useState(50)
  const [currentLevel, setCurrentLevel] = useState(0)
  const [score, setScore] = useState(0)
  const [timeInTarget, setTimeInTarget] = useState(0)
  const [targetReached, setTargetReached] = useState(false)
  const [targetHistory, setTargetHistory] = useState<Array<{ level: number; success: boolean }>>([])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  // Map sensor value to grip level (0-100) with improved accuracy
  useEffect(() => {
    // Enhanced mapping with adaptive range and smoothing
    const baseValue = 400
    const maxValue = 800
    const range = maxValue - baseValue

    // Apply exponential moving average for smoother transitions
    const alpha = 0.15 // Smoothing factor (lower = more smoothing)
    const rawLevel = Math.max(0, Math.min(100, ((sensorValue - baseValue) / range) * 100))

    setCurrentLevel((prev) => {
      return prev * (1 - alpha) + rawLevel * alpha
    })
  }, [sensorValue])

  // Check if current level is within target range with improved accuracy
  useEffect(() => {
    if (!exerciseActive) return

    // Dynamic tolerance based on difficulty (could be adjusted based on user progress)
    const baseTolerance = 10 // Base acceptable range around target
    const tolerance = baseTolerance * (1 - score * 0.05) // Tolerance decreases as score increases
    const adjustedTolerance = Math.max(5, Math.min(baseTolerance, tolerance)) // Clamp between 5-10

    const isInTarget = Math.abs(currentLevel - targetLevel) <= adjustedTolerance

    if (isInTarget) {
      setTimeInTarget((prev) => prev + 1)

      // Provide visual feedback on progress
      if (timeInTarget >= 30 && !targetReached) {
        // Hold for 3 seconds (30 * 100ms)
        setTargetReached(true)
        setScore((prev) => prev + 1)
        setTargetHistory((prev) => [...prev, { level: targetLevel, success: true }])

        // Generate new target after success with progressive difficulty
        setTimeout(() => {
          // As score increases, targets become more specific (narrower range)
          const minTarget = 10 + score * 2
          const maxTarget = 90 - score * 2
          const range = Math.max(20, maxTarget - minTarget) // Ensure minimum range of 20
          const newTarget = Math.floor(Math.random() * range) + minTarget

          setTargetLevel(newTarget)
          setTargetReached(false)
          setTimeInTarget(0)
        }, 1000)
      }
    } else {
      // Reset progress more gradually for near misses
      const distance = Math.abs(currentLevel - targetLevel)
      if (distance > adjustedTolerance * 2) {
        setTimeInTarget(0) // Far miss - reset completely
      } else {
        setTimeInTarget((prev) => Math.max(0, prev - 2)) // Near miss - decrease more slowly
      }
    }
  }, [currentLevel, targetLevel, exerciseActive, timeInTarget, targetReached, score])

  // Draw canvas visualization with enhanced visuals
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const drawFrame = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const width = canvas.width
      const height = canvas.height

      // Draw background with gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height)
      bgGradient.addColorStop(0, "#f8fafc")
      bgGradient.addColorStop(1, "#f1f5f9")
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, width, height)

      // Calculate dynamic tolerance based on score
      const baseTolerance = 10
      const tolerance = Math.max(5, baseTolerance - score * 0.5)
      const toleranceHeight = (tolerance / 100) * height

      // Draw target zone with gradient
      const targetY = height - (targetLevel / 100) * height

      const targetGradient = ctx.createLinearGradient(0, targetY - toleranceHeight, 0, targetY + toleranceHeight)
      if (targetReached) {
        targetGradient.addColorStop(0, "rgba(34, 197, 94, 0.1)")
        targetGradient.addColorStop(0.5, "rgba(34, 197, 94, 0.3)")
        targetGradient.addColorStop(1, "rgba(34, 197, 94, 0.1)")
      } else {
        targetGradient.addColorStop(0, "rgba(8, 145, 178, 0.1)")
        targetGradient.addColorStop(0.5, "rgba(8, 145, 178, 0.3)")
        targetGradient.addColorStop(1, "rgba(8, 145, 178, 0.1)")
      }

      ctx.fillStyle = targetGradient
      ctx.fillRect(0, targetY - toleranceHeight, width, toleranceHeight * 2)

      // Draw target line with glow effect
      ctx.shadowColor = targetReached ? "rgba(34, 197, 94, 0.5)" : "rgba(8, 145, 178, 0.5)"
      ctx.shadowBlur = 5
      ctx.strokeStyle = targetReached ? "rgb(34, 197, 94)" : "rgb(8, 145, 178)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, targetY)
      ctx.lineTo(width, targetY)
      ctx.stroke()
      ctx.shadowBlur = 0 // Reset shadow

      // Draw grid lines with improved styling
      ctx.strokeStyle = "rgba(226, 232, 240, 0.8)"
      ctx.lineWidth = 1

      for (let i = 0; i <= 100; i += 10) {
        const y = height - (i / 100) * height

        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Draw current level
      const currentY = height - (currentLevel / 100) * height

      // Draw ball at current level with shadow and gradient
      const radius = 15
      const isInTarget = Math.abs(currentLevel - targetLevel) <= tolerance

      // Add shadow to ball
      ctx.shadowColor = isInTarget ? "rgba(34, 197, 94, 0.5)" : "rgba(244, 63, 94, 0.5)"
      ctx.shadowBlur = 10
      ctx.shadowOffsetY = 3

      // Create gradient for ball
      const ballGradient = ctx.createRadialGradient(width / 2, currentY - 3, 0, width / 2, currentY, radius)

      if (isInTarget) {
        ballGradient.addColorStop(0, "rgb(74, 222, 128)")
        ballGradient.addColorStop(1, "rgb(22, 163, 74)")
      } else {
        ballGradient.addColorStop(0, "rgb(251, 113, 133)")
        ballGradient.addColorStop(1, "rgb(225, 29, 72)")
      }

      ctx.fillStyle = ballGradient
      ctx.beginPath()
      ctx.arc(width / 2, currentY, radius, 0, Math.PI * 2)
      ctx.fill()

      // Reset shadow
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0

      // Draw progress indicator for holding in target zone with animated glow
      if (timeInTarget > 0 && !targetReached) {
        const maxTime = 30 // 3 seconds
        const progressPercent = timeInTarget / maxTime

        // Pulsating effect
        const pulseIntensity = 1 + Math.sin(Date.now() / 200) * 0.1
        const pulseRadius = (radius + 5) * pulseIntensity

        ctx.strokeStyle = "rgb(34, 197, 94)"
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(width / 2, currentY, pulseRadius, 0, Math.PI * 2 * progressPercent)
        ctx.stroke()

        // Add glow dots at the progress end point
        if (progressPercent > 0.05) {
          const angle = Math.PI * 2 * progressPercent - Math.PI / 2
          const glowX = width / 2 + Math.cos(angle) * pulseRadius
          const glowY = currentY + Math.sin(angle) * pulseRadius

          ctx.fillStyle = "rgb(34, 197, 94)"
          ctx.beginPath()
          ctx.arc(glowX, glowY, 4, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Draw scale on the left side with improved styling
      for (let i = 0; i <= 100; i += 10) {
        const y = height - (i / 100) * height

        // Only draw text for every 20%
        if (i % 20 === 0) {
          ctx.fillStyle = "#64748b"
          ctx.textAlign = "left"
          ctx.textBaseline = "middle"
          ctx.font = "bold 12px sans-serif"
          ctx.fillText(`${i}%`, 10, y)

          // Longer tick marks for major increments
          ctx.strokeStyle = "rgba(100, 116, 139, 0.4)"
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(30, y)
          ctx.lineTo(50, y)
          ctx.stroke()
        } else {
          // Shorter tick marks for minor increments
          ctx.strokeStyle = "rgba(100, 116, 139, 0.2)"
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(35, y)
          ctx.lineTo(45, y)
          ctx.stroke()
        }
      }

      // Draw current level indicator on the scale
      ctx.fillStyle = "#0c4a6e"
      ctx.textAlign = "left"
      ctx.textBaseline = "middle"
      ctx.font = "bold 14px sans-serif"
      ctx.fillText(`${currentLevel.toFixed(1)}%`, 55, currentY)

      // Draw arrow pointing to current level
      ctx.fillStyle = "#0c4a6e"
      ctx.beginPath()
      ctx.moveTo(50, currentY)
      ctx.lineTo(55, currentY - 5)
      ctx.lineTo(55, currentY + 5)
      ctx.closePath()
      ctx.fill()

      // Draw target level indicator on the right side
      ctx.fillStyle = targetReached ? "#166534" : "#0c4a6e"
      ctx.textAlign = "right"
      ctx.textBaseline = "middle"
      ctx.font = "bold 14px sans-serif"
      ctx.fillText(`Target: ${targetLevel}%`, width - 10, targetY)

      animationRef.current = requestAnimationFrame(drawFrame)
    }

    drawFrame()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [currentLevel, targetLevel, timeInTarget, targetReached, score])

  // Start exercise
  const startExercise = () => {
    setExerciseActive(true)
    setScore(0)
    setTargetHistory([])
    setTimeInTarget(0)
    setTargetReached(false)

    // Set initial random target
    const initialTarget = Math.floor(Math.random() * 80) + 10 // Random target between 10-90
    setTargetLevel(initialTarget)
  }

  // Reset exercise
  const resetExercise = () => {
    setExerciseActive(false)
    setScore(0)
    setTargetHistory([])
    setTimeInTarget(0)
    setTargetReached(false)
  }

  // Fail current target
  const skipTarget = () => {
    if (!exerciseActive) return

    setTargetHistory((prev) => [...prev, { level: targetLevel, success: false }])

    // Generate new target
    const newTarget = Math.floor(Math.random() * 80) + 10 // Random target between 10-90
    setTargetLevel(newTarget)
    setTargetReached(false)
    setTimeInTarget(0)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Precision Training</CardTitle>
          <CardDescription>Practice controlling the strength of your grip</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Current Grip Level</span>
                <Badge variant="outline">{currentLevel.toFixed(0)}%</Badge>
              </div>
              <Progress value={currentLevel} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Target Level</span>
                <Badge variant={targetReached ? "success" : "default"}>
                  {targetLevel}% {targetReached && <CheckCircle2Icon className="h-3 w-3 ml-1" />}
                </Badge>
              </div>
              <Progress value={targetLevel} className="h-2 bg-blue-100 dark:bg-blue-950">
                <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${targetLevel}%` }} />
              </Progress>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Score</p>
                <p className="text-2xl font-bold">{score}</p>
                <p className="text-xs text-muted-foreground">{targetHistory.length} targets attempted</p>
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

                <Button variant="outline" onClick={skipTarget} disabled={!exerciseActive || targetReached}>
                  <RefreshCwIcon className="h-4 w-4 mr-2" />
                  Skip Target
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Recent Attempts</h3>
              <div className="flex flex-wrap gap-2">
                {targetHistory.slice(-10).map((target, index) => (
                  <Badge
                    key={index}
                    variant={target.success ? "default" : "destructive"}
                    className={target.success ? "bg-green-500" : ""}
                  >
                    {target.level}%
                    {target.success ? (
                      <CheckCircle2Icon className="h-3 w-3 ml-1" />
                    ) : (
                      <XCircleIcon className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
                {targetHistory.length === 0 && <p className="text-sm text-muted-foreground">No attempts yet</p>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visual Feedback</CardTitle>
          <CardDescription>
            {exerciseActive
              ? targetReached
                ? "Target reached! Hold for the next target."
                : "Try to match and hold the target level"
              : "Start the exercise to begin training"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
          <canvas
            ref={canvasRef}
            width={300}
            height={400}
            className="w-full max-w-[300px] h-auto border border-gray-200 rounded-lg"
          />

          {exerciseActive ? (
            <div className="mt-4 text-center">
              <p className="text-lg font-medium">
                {targetReached ? "Great job! Next target coming soon..." : "Adjust your grip to match the target level"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">Hold the target level for 3 seconds to succeed</p>
            </div>
          ) : (
            <div className="mt-4 text-center">
              <p className="text-lg font-medium">Press "Start Exercise" to begin</p>
              <p className="text-sm text-muted-foreground mt-2">You'll practice controlling different grip strengths</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
