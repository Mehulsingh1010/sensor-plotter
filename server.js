const http = require("http")
const { Server } = require("socket.io")
const { SerialPort } = require("serialport")
const { ReadlineParser } = require("@serialport/parser-readline")

// Create HTTP server
const server = http.createServer()
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Your frontend's port
  },
})

// Set up SerialPort for Arduino on COM17
const port = new SerialPort({
  path: "COM17",
  baudRate: 115200,
})

// Read line by line from serial
const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }))

// Buffer to collect data and throttle emissions
let dataBuffer = []
const EMIT_INTERVAL = 20 // ms - adjust for smoother data flow

// Set up throttled emission
setInterval(() => {
  if (dataBuffer.length > 0) {
    // Send the most recent data point
    io.emit("sensorData", dataBuffer[dataBuffer.length - 1])
    dataBuffer = []
  }
}, EMIT_INTERVAL)

// Collect data from serial port
parser.on("data", (line) => {
  console.log("📥 Serial data:", line)
  dataBuffer.push(line.trim())
})

port.on("open", () => {
  console.log("✅ Serial port COM17 is open")
})

port.on("error", (err) => {
  console.error("❌ Serial error:", err.message)
})

server.listen(3001, () => {
  console.log("✅ Backend server running on http://localhost:3001")
})