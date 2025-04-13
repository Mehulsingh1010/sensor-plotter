"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlayIcon, PauseIcon, RefreshCwIcon, TrophyIcon, TimerIcon, HeartIcon } from "lucide-react"

interface GamesTrainingProps {
  sensorValue: number
}

export default function GamesTraining({ sensorValue }: GamesTrainingProps) {
  return (
    <Tabs defaultValue="balloon" className="w-full">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="balloon" className="text-sm py-2">
          <span className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1.5 sm:mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 8a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2z" />
              <path d="M12 2v2" />
              <path d="M12 16v2" />
              <path d="M12 22v-2" />
              <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
            </svg>
            Balloon Challenge
          </span>
        </TabsTrigger>
        <TabsTrigger value="fruit" className="text-sm py-2">
          <span className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1.5 sm:mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 11c.3 1.3.3 2.7 0 4" />
              <path d="M9 18h6" />
              <path d="M17 18h2a2 2 0 0 0 2-2v-5" />
              <path d="M19 11V9a2 2 0 0 0-2-2h-1" />
              <path d="M7 11V9a2 2 0 0 1 2-2h1" />
              <path d="M7 11c-.3 1.3-.3 2.7 0 4" />
              <path d="M5 18h2" />
              <path d="M5 11v7" />
              <path d="M12 4C8 4 7 8 7 11" />
              <path d="M12 4c4 0 5 4 5 7" />
            </svg>
            Fruit Catcher
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="balloon">
        <BalloonGame sensorValue={sensorValue} />
      </TabsContent>

      <TabsContent value="fruit">
        <FruitCatcherGame sensorValue={sensorValue} />
      </TabsContent>
    </Tabs>
  )
}

// Balloon Challenge Game
function BalloonGame({ sensorValue }: { sensorValue: number }) {
  const [gameActive, setGameActive] = useState(false)
  const [score, setScore] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(60)
  const [balloonSize, setBalloonSize] = useState(50)
  const [balloonPopped, setBalloonPopped] = useState(false)
  const [highScore, setHighScore] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Map sensor value to balloon inflation
  useEffect(() => {
    if (!gameActive) return

    // Inflate balloon based on sensor value
    // Assuming sensor range is approximately 400-800
    const baseValue = 400
    const range = 400
    const normalized = Math.max(0, Math.min(100, ((sensorValue - baseValue) / range) * 100))

    // Only inflate if grip is strong enough (above 60%)
    if (normalized > 60 && !balloonPopped) {
      setBalloonSize((prev) => {
        const newSize = prev + 0.5

        // Check if balloon popped
        if (newSize > 200) {
          setBalloonPopped(true)
          setScore((prev) => prev + 1)

          // Reset balloon after a short delay
          setTimeout(() => {
            setBalloonSize(50)
            setBalloonPopped(false)
          }, 1000)

          return 200
        }

        return newSize
      })
    } else if (normalized < 30) {
      // Balloon slowly deflates when not gripping
      setBalloonSize((prev) => Math.max(50, prev - 0.2))
    }
  }, [sensorValue, gameActive, balloonPopped])

  // Game timer
  useEffect(() => {
    if (gameActive && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining((prev) => prev - 1)
      }, 1000)
    } else if (timeRemaining === 0 && gameActive) {
      endGame()
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [gameActive, timeRemaining])

  // Draw canvas animation with enhanced visuals
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

      // Draw sky background with gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height)
      bgGradient.addColorStop(0, "#e0f2fe")
      bgGradient.addColorStop(1, "#bae6fd")
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, width, height)

      // Add clouds for a more engaging background
      const drawCloud = (x, y, size) => {
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.arc(x + size, y - size / 2, size * 0.8, 0, Math.PI * 2)
        ctx.arc(x + size * 1.5, y, size, 0, Math.PI * 2)
        ctx.arc(x + size * 0.5, y + size / 2, size * 0.8, 0, Math.PI * 2)
        ctx.fill()
      }

      drawCloud(width * 0.2, height * 0.2, 20)
      drawCloud(width * 0.7, height * 0.3, 25)
      drawCloud(width * 0.4, height * 0.1, 15)

      const centerX = width / 2
      const centerY = height / 2

      if (balloonPopped) {
        // Draw explosion with improved particle effects
        const particles = 20
        const radius = balloonSize / 2

        // Add glow effect
        ctx.shadowColor = "rgba(244, 63, 94, 0.6)"
        ctx.shadowBlur = 20

        for (let i = 0; i < particles; i++) {
          const angle = (i / particles) * Math.PI * 2
          const distance = radius * (0.8 + Math.random() * 0.5) // Randomize particle distance
          const x = centerX + Math.cos(angle) * distance
          const y = centerY + Math.sin(angle) * distance
          const particleSize = 3 + Math.random() * 5 // Randomize particle size

          // Create gradient for particles
          const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, particleSize)
          particleGradient.addColorStop(0, "rgb(254, 202, 202)")
          particleGradient.addColorStop(1, "rgb(239, 68, 68)")

          ctx.fillStyle = particleGradient
          ctx.beginPath()
          ctx.arc(x, y, particleSize, 0, Math.PI * 2)
          ctx.fill()
        }

        // Draw "POP!" text with animation effect
        const popScale = 1 + Math.sin(Date.now() / 150) * 0.1 // Pulsating effect

        ctx.shadowColor = "rgba(34, 197, 94, 0.7)"
        ctx.shadowBlur = 10
        ctx.fillStyle = "rgb(22, 163, 74)"
        ctx.font = `bold ${24 * popScale}px sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText("POP!", centerX, centerY)

        // Reset shadow
        ctx.shadowBlur = 0
      } else {
        // Draw balloon with gradient and shine effect
        const balloonGradient = ctx.createRadialGradient(
          centerX - balloonSize / 4,
          centerY - balloonSize / 4,
          0,
          centerX,
          centerY,
          balloonSize / 2,
        )
        balloonGradient.addColorStop(0, "rgb(254, 202, 202)")
        balloonGradient.addColorStop(0.7, "rgb(239, 68, 68)")
        balloonGradient.addColorStop(1, "rgb(220, 38, 38)")

        // Add shadow for 3D effect
        ctx.shadowColor = "rgba(0, 0, 0, 0.2)"
        ctx.shadowBlur = 10
        ctx.shadowOffsetY = 5

        ctx.fillStyle = balloonGradient
        ctx.beginPath()

        // Draw balloon with slight oval shape
        ctx.ellipse(centerX, centerY, balloonSize / 2, (balloonSize / 2) * 1.1, 0, 0, Math.PI * 2)
        ctx.fill()

        // Reset shadow
        ctx.shadowBlur = 0
        ctx.shadowOffsetY = 0

        // Add shine effect (highlight)
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
        ctx.beginPath()
        ctx.ellipse(
          centerX - balloonSize / 5,
          centerY - balloonSize / 5,
          balloonSize / 6,
          balloonSize / 8,
          Math.PI / 4,
          0,
          Math.PI * 2,
        )
        ctx.fill()

        // Draw balloon knot with better shape
        ctx.fillStyle = "rgb(220, 38, 38)"
        ctx.beginPath()
        ctx.moveTo(centerX - 5, centerY + balloonSize / 2)
        ctx.quadraticCurveTo(centerX, centerY + balloonSize / 2 + 5, centerX + 5, centerY + balloonSize / 2)
        ctx.quadraticCurveTo(centerX, centerY + balloonSize / 2 + 15, centerX - 5, centerY + balloonSize / 2)
        ctx.fill()

        // Draw balloon string with slight curve
        ctx.strokeStyle = "rgb(100, 116, 139)"
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(centerX, centerY + balloonSize / 2 + 10)
        ctx.quadraticCurveTo(
          centerX + 10 * Math.sin(Date.now() / 1000), // Gentle swaying motion
          centerY + (height - centerY - balloonSize / 2) / 2,
          centerX,
          height - 50,
        )
        ctx.stroke()
      }

      // Draw inflation meter with improved styling
      const meterWidth = 30
      const meterHeight = height - 100
      const meterX = width - 50
      const meterY = 50

      // Draw meter background with gradient
      const meterBgGradient = ctx.createLinearGradient(meterX, meterY, meterX, meterY + meterHeight)
      meterBgGradient.addColorStop(0, "rgba(241, 245, 249, 0.7)")
      meterBgGradient.addColorStop(1, "rgba(226, 232, 240, 0.7)")

      ctx.fillStyle = meterBgGradient
      ctx.fillRect(meterX, meterY, meterWidth, meterHeight)

      // Draw fill with gradient
      const fillHeight = ((balloonSize - 50) / 150) * meterHeight
      const fillGradient = ctx.createLinearGradient(
        meterX,
        meterY + meterHeight - fillHeight,
        meterX,
        meterY + meterHeight,
      )
      fillGradient.addColorStop(0, "rgb(254, 202, 202)")
      fillGradient.addColorStop(1, "rgb(239, 68, 68)")

      ctx.fillStyle = fillGradient
      ctx.fillRect(meterX, meterY + meterHeight - fillHeight, meterWidth, fillHeight)

      // Draw meter border with rounded corners
      ctx.strokeStyle = "rgb(100, 116, 139)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(meterX, meterY, meterWidth, meterHeight, 5)
      ctx.stroke()

      // Draw danger zone with pattern
      ctx.fillStyle = "rgba(244, 63, 94, 0.3)"
      ctx.fillRect(meterX, meterY, meterWidth, 30)

      // Add danger stripes
      ctx.fillStyle = "rgba(244, 63, 94, 0.5)"
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.moveTo(meterX, meterY + i * 10)
        ctx.lineTo(meterX + meterWidth, meterY + i * 10 + 5)
        ctx.lineTo(meterX + meterWidth, meterY + i * 10 + 10)
        ctx.lineTo(meterX, meterY + i * 10 + 5)
        ctx.closePath()
        ctx.fill()
      }

      // Add labels to the meter
      ctx.fillStyle = "#334155"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "right"
      ctx.textBaseline = "middle"
      ctx.fillText("MAX", meterX - 5, meterY + 15)
      ctx.fillText("MIN", meterX - 5, meterY + meterHeight - 15)

      animationRef.current = requestAnimationFrame(drawFrame)
    }

    drawFrame()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [balloonSize, balloonPopped])

  // Start game
  const startGame = () => {
    setGameActive(true)
    setTimeRemaining(60)
    setScore(0)
    setBalloonSize(50)
    setBalloonPopped(false)
  }

  // End game
  const endGame = () => {
    setGameActive(false)
    if (score > highScore) {
      setHighScore(score)
    }
  }

  // Reset game
  const resetGame = () => {
    setGameActive(false)
    setTimeRemaining(60)
    setScore(0)
    setBalloonSize(50)
    setBalloonPopped(false)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Balloon Challenge</CardTitle>
          <CardDescription>Inflate and pop as many balloons as you can</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Score</p>
                <p className="text-3xl font-bold">{score}</p>
              </div>

              <div>
                <p className="text-sm font-medium flex items-center">
                  <TimerIcon className="h-4 w-4 mr-1" />
                  Time Remaining
                </p>
                <p className="text-3xl font-bold">{timeRemaining}s</p>
              </div>

              <div>
                <p className="text-sm font-medium flex items-center">
                  <TrophyIcon className="h-4 w-4 mr-1" />
                  High Score
                </p>
                <p className="text-3xl font-bold">{highScore}</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={gameActive ? resetGame : startGame}
                variant={gameActive ? "destructive" : "default"}
                size="lg"
              >
                {gameActive ? (
                  <>
                    <PauseIcon className="h-4 w-4 mr-2" />
                    Stop Game
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Start Game
                  </>
                )}
              </Button>

              <Button variant="outline" onClick={resetGame} disabled={!gameActive} size="lg">
                <RefreshCwIcon className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">How to Play</h3>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Contract your forearm muscles to inflate the balloon</li>
                <li>The stronger your grip, the faster the balloon inflates</li>
                <li>Try to pop as many balloons as possible in 60 seconds</li>
                <li>Relax your muscles to let the balloon deflate slightly</li>
                <li>Be careful not to fatigue your muscles too quickly!</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Game Area</CardTitle>
          <CardDescription>
            {gameActive ? "Squeeze hard to inflate the balloon until it pops!" : "Start the game to begin playing"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="w-full max-w-[400px] h-auto border border-gray-200 rounded-lg"
          />
        </CardContent>
        <CardFooter className="justify-center">
          {gameActive ? (
            <Badge variant="outline" className="text-lg px-4 py-2">
              {balloonPopped ? "Great job! Next balloon coming..." : "Squeeze hard to inflate the balloon!"}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-lg px-4 py-2">
              Press "Start Game" to begin
            </Badge>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

// Fruit Catcher Game
function FruitCatcherGame({ sensorValue }: { sensorValue: number }) {
  const [gameActive, setGameActive] = useState(false)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [highScore, setHighScore] = useState(0)
  const [basketPosition, setBasketPosition] = useState(50)
  const [fruits, setFruits] = useState<Array<{ x: number; y: number; type: number; speed: number }>>([])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const lastFruitRef = useRef<number>(0)

  // Map sensor value to basket position
  useEffect(() => {
    if (!gameActive) return

    // Move basket based on sensor value
    // Assuming sensor range is approximately 400-800
    const baseValue = 400
    const range = 400
    const normalized = Math.max(0, Math.min(100, ((sensorValue - baseValue) / range) * 100))

    setBasketPosition(normalized)
  }, [sensorValue, gameActive])

  // Game logic
  useEffect(() => {
    if (!gameActive) return

    const gameLoop = () => {
      // Add new fruit occasionally
      const now = Date.now()
      if (now - lastFruitRef.current > 1500) {
        const newFruit = {
          x: Math.random() * 80 + 10, // Random position between 10-90%
          y: 0,
          type: Math.floor(Math.random() * 3), // 0: apple, 1: orange, 2: banana
          speed: Math.random() * 1 + 1, // Random speed
        }

        setFruits((prev) => [...prev, newFruit])
        lastFruitRef.current = now
      }

      // Move fruits down
      setFruits((prev) => {
        const updated = prev.map((fruit) => ({
          ...fruit,
          y: fruit.y + fruit.speed,
        }))

        // Check for caught fruits or missed fruits
        const remaining = updated.filter((fruit) => {
          // Check if fruit is caught
          if (fruit.y > 85 && fruit.y < 95) {
            const basketLeft = basketPosition - 10
            const basketRight = basketPosition + 10

            if (fruit.x > basketLeft && fruit.x < basketRight) {
              // Fruit caught
              setScore((prev) => prev + 1)
              return false
            }
          }

          // Check if fruit is missed
          if (fruit.y > 100) {
            setLives((prev) => {
              const newLives = prev - 1
              if (newLives <= 0) {
                endGame()
              }
              return newLives
            })
            return false
          }

          return true
        })

        return remaining
      })

      animationRef.current = requestAnimationFrame(gameLoop)
    }

    animationRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameActive, basketPosition])

  // Draw canvas animation
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

      // Draw background
      ctx.fillStyle = "#f1f5f9"
      ctx.fillRect(0, 0, width, height)

      // Draw basket with improved 3D effect
      const basketWidth = width * 0.2
      const basketHeight = height * 0.1
      const basketX = (basketPosition / 100) * width - basketWidth / 2
      const basketY = height - basketHeight - 10

      // Add shadow for 3D effect
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
      ctx.shadowBlur = 10
      ctx.shadowOffsetY = 5

      // Draw basket body with wood texture
      const basketGradient = ctx.createLinearGradient(basketX, basketY, basketX, basketY + basketHeight)
      basketGradient.addColorStop(0, "rgb(146, 64, 14)")
      basketGradient.addColorStop(0.5, "rgb(120, 53, 15)")
      basketGradient.addColorStop(1, "rgb(103, 45, 13)")

      ctx.fillStyle = basketGradient
      ctx.beginPath()
      ctx.roundRect(basketX, basketY, basketWidth, basketHeight, 5)
      ctx.fill()

      // Draw basket rim
      ctx.fillStyle = "rgb(146, 64, 14)"
      ctx.beginPath()
      ctx.ellipse(basketX + basketWidth / 2, basketY, basketWidth / 2, basketHeight / 4, 0, Math.PI, 0, true)
      ctx.fill()

      ctx.beginPath()
      ctx.ellipse(
        basketX + basketWidth / 2,
        basketY + basketHeight,
        basketWidth / 2,
        basketHeight / 4,
        0,
        0,
        Math.PI,
        true,
      )
      ctx.fill()

      // Add basket weave texture
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
      ctx.lineWidth = 1

      // Horizontal weave
      for (let i = 1; i < 4; i++) {
        ctx.beginPath()
        ctx.moveTo(basketX, basketY + (i * basketHeight) / 4)
        ctx.lineTo(basketX + basketWidth, basketY + (i * basketHeight) / 4)
        ctx.stroke()
      }

      // Vertical weave
      for (let i = 1; i < 5; i++) {
        ctx.beginPath()
        ctx.moveTo(basketX + (i * basketWidth) / 5, basketY)
        ctx.lineTo(basketX + (i * basketWidth) / 5, basketY + basketHeight)
        ctx.stroke()
      }

      // Reset shadow
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0

      // Draw fruits with improved visuals
      fruits.forEach((fruit) => {
        const fruitX = (fruit.x / 100) * width
        const fruitY = (fruit.y / 100) * height
        const fruitRadius = 15

        // Add shadow for 3D effect
        ctx.shadowColor = "rgba(0, 0, 0, 0.2)"
        ctx.shadowBlur = 5
        ctx.shadowOffsetY = 3

        if (fruit.type === 0) {
          // Apple (red) with gradient and details
          const appleGradient = ctx.createRadialGradient(fruitX - 3, fruitY - 3, 0, fruitX, fruitY, fruitRadius)
          appleGradient.addColorStop(0, "rgb(254, 202, 202)")
          appleGradient.addColorStop(0.7, "rgb(239, 68, 68)")
          appleGradient.addColorStop(1, "rgb(185, 28, 28)")

          ctx.fillStyle = appleGradient
          ctx.beginPath()
          ctx.arc(fruitX, fruitY, fruitRadius, 0, Math.PI * 2)
          ctx.fill()

          // Stem
          ctx.fillStyle = "rgb(120, 53, 15)"
          ctx.fillRect(fruitX - 2, fruitY - fruitRadius - 5, 4, 5)

          // Leaf
          ctx.fillStyle = "rgb(34, 197, 94)"
          ctx.beginPath()
          ctx.ellipse(fruitX + 4, fruitY - fruitRadius - 3, 5, 3, Math.PI / 4, 0, Math.PI * 2)
          ctx.fill()

          // Highlight
          ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
          ctx.beginPath()
          ctx.arc(fruitX - 5, fruitY - 5, 5, 0, Math.PI * 2)
          ctx.fill()
        } else if (fruit.type === 1) {
          // Orange with gradient and texture
          const orangeGradient = ctx.createRadialGradient(fruitX - 3, fruitY - 3, 0, fruitX, fruitY, fruitRadius)
          orangeGradient.addColorStop(0, "rgb(254, 215, 170)")
          orangeGradient.addColorStop(0.7, "rgb(249, 115, 22)")
          orangeGradient.addColorStop(1, "rgb(194, 65, 12)")

          ctx.fillStyle = orangeGradient
          ctx.beginPath()
          ctx.arc(fruitX, fruitY, fruitRadius, 0, Math.PI * 2)
          ctx.fill()

          // Texture lines
          ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
          ctx.lineWidth = 0.5
          for (let i = 0; i < 3; i++) {
            ctx.beginPath()
            ctx.arc(fruitX, fruitY, fruitRadius * (0.5 + i * 0.2), 0, Math.PI * 2)
            ctx.stroke()
          }

          // Highlight
          ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
          ctx.beginPath()
          ctx.arc(fruitX - 5, fruitY - 5, 5, 0, Math.PI * 2)
          ctx.fill()
        } else {
          // Banana (yellow) with gradient and curve
          ctx.save()
          ctx.translate(fruitX, fruitY)
          ctx.rotate(Math.PI / 4)

          const bananaGradient = ctx.createLinearGradient(-fruitRadius * 1.5, 0, fruitRadius * 1.5, 0)
          bananaGradient.addColorStop(0, "rgb(254, 240, 138)")
          bananaGradient.addColorStop(0.7, "rgb(234, 179, 8)")
          bananaGradient.addColorStop(1, "rgb(202, 138, 4)")

          ctx.fillStyle = bananaGradient

          // Draw curved banana shape
          ctx.beginPath()
          ctx.ellipse(0, 0, fruitRadius * 1.5, fruitRadius * 0.7, 0, 0, Math.PI * 2)
          ctx.fill()

          // Add banana details (brown tips)
          ctx.fillStyle = "rgb(120, 53, 15)"
          ctx.beginPath()
          ctx.ellipse(fruitRadius * 1.2, 0, fruitRadius * 0.3, fruitRadius * 0.2, 0, 0, Math.PI * 2)
          ctx.fill()

          // Highlight
          ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
          ctx.beginPath()
          ctx.ellipse(-fruitRadius * 0.5, -fruitRadius * 0.2, fruitRadius * 0.7, fruitRadius * 0.3, 0, 0, Math.PI * 2)
          ctx.fill()

          ctx.restore()
        }

        // Reset shadow
        ctx.shadowBlur = 0
        ctx.shadowOffsetY = 0
      })

      // Draw lives
      for (let i = 0; i < lives; i++) {
        const heartX = 30 + i * 30
        const heartY = 30

        ctx.fillStyle = "rgb(244, 63, 94)"
        ctx.beginPath()
        ctx.moveTo(heartX, heartY)
        ctx.bezierCurveTo(heartX - 7, heartY - 10, heartX - 15, heartY + 5, heartX, heartY + 15)
        ctx.bezierCurveTo(heartX + 15, heartY + 5, heartX + 7, heartY - 10, heartX, heartY)
        ctx.fill()
      }

      // Draw score
      ctx.fillStyle = "#64748b"
      ctx.font = "bold 16px sans-serif"
      ctx.textAlign = "right"
      ctx.textBaseline = "top"
      ctx.fillText(`Score: ${score}`, width - 20, 20)

      // Game over screen
      if (!gameActive && lives <= 0) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
        ctx.fillRect(0, 0, width, height)

        ctx.fillStyle = "white"
        ctx.font = "bold 32px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText("GAME OVER", width / 2, height / 2 - 20)

        ctx.font = "bold 24px sans-serif"
        ctx.fillText(`Final Score: ${score}`, width / 2, height / 2 + 20)

        ctx.font = "18px sans-serif"
        ctx.fillText("Press Start to play again", width / 2, height / 2 + 60)
      }

      animationRef.current = requestAnimationFrame(drawFrame)
    }

    drawFrame()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [fruits, basketPosition, lives, score, gameActive])

  // Start game
  const startGame = () => {
    setGameActive(true)
    setLives(3)
    setScore(0)
    setFruits([])
    lastFruitRef.current = Date.now()
  }

  // End game
  const endGame = () => {
    setGameActive(false)
    if (score > highScore) {
      setHighScore(score)
    }
  }

  // Reset game
  const resetGame = () => {
    setGameActive(false)
    setLives(3)
    setScore(0)
    setFruits([])
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Fruit Catcher</CardTitle>
          <CardDescription>Catch falling fruits by controlling the basket</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Score</p>
                <p className="text-3xl font-bold">{score}</p>
              </div>

              <div>
                <p className="text-sm font-medium flex items-center">
                  <HeartIcon className="h-4 w-4 mr-1" />
                  Lives
                </p>
                <p className="text-3xl font-bold">{lives}</p>
              </div>

              <div>
                <p className="text-sm font-medium flex items-center">
                  <TrophyIcon className="h-4 w-4 mr-1" />
                  High Score
                </p>
                <p className="text-3xl font-bold">{highScore}</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={gameActive ? resetGame : startGame}
                variant={gameActive ? "destructive" : "default"}
                size="lg"
              >
                {gameActive ? (
                  <>
                    <PauseIcon className="h-4 w-4 mr-2" />
                    Stop Game
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Start Game
                  </>
                )}
              </Button>

              <Button variant="outline" onClick={resetGame} disabled={!gameActive} size="lg">
                <RefreshCwIcon className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">How to Play</h3>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Control the basket by varying your muscle contraction</li>
                <li>Stronger contraction moves the basket to the right</li>
                <li>Relaxing moves the basket to the left</li>
                <li>Catch as many fruits as possible</li>
                <li>You lose a life for each fruit you miss</li>
                <li>Game ends when you lose all three lives</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Game Area</CardTitle>
          <CardDescription>
            {gameActive ? "Control the basket with your muscle signals!" : "Start the game to begin playing"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="w-full max-w-[400px] h-auto border border-gray-200 rounded-lg"
          />
        </CardContent>
        <CardFooter className="justify-center">
          {gameActive ? (
            <Badge variant="outline" className="text-lg px-4 py-2">
              Contract to move right, relax to move left
            </Badge>
          ) : (
            <Badge variant="outline" className="text-lg px-4 py-2">
              Press "Start Game" to begin
            </Badge>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
