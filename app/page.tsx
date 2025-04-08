'use client';

import { useEffect, useState, useRef, useCallback, SetStateAction } from 'react';
import { io } from 'socket.io-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PauseIcon, PlayIcon, ZapIcon, DownloadIcon, RefreshCwIcon } from 'lucide-react';
import { Line } from 'react-chartjs-2';
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
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  LineElement, 
  PointElement, 
  LinearScale, 
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SOCKET_SERVER_URL = 'http://localhost:3001';
const DEFAULT_MAX_POINTS = 100;

export default function Home() {
  const [dataPoints, setDataPoints] = useState<number[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [maxPoints, setMaxPoints] = useState(DEFAULT_MAX_POINTS);
  const [smoothing, setSmoothing] = useState(0.2);
  const [showArea, setShowArea] = useState(false);
  const [stats, setStats] = useState({ min: 0, max: 0, avg: 0, current: 0 });
  
  const socketRef = useRef<any>(null);
  const bufferRef = useRef<number[]>([]);
  const frameRef = useRef<number | null>(null);
  
  // Calculate statistics from data points
  const calculateStats = useCallback((data: number[]) => {
    if (data.length === 0) return { min: 0, max: 0, avg: 0, current: 0 };
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const sum = data.reduce((acc, val) => acc + val, 0);
    const avg = sum / data.length;
    const current = data[data.length - 1] || 0;
    
    return { min, max, avg, current };
  }, []);

  // Update chart with buffered data using requestAnimationFrame
  const updateChart = useCallback(() => {
    if (isPaused) {
      frameRef.current = requestAnimationFrame(updateChart);
      return;
    }
    
    if (bufferRef.current.length > 0) {
      setDataPoints(prev => {
        const updated = [...prev, ...bufferRef.current];
        bufferRef.current = [];
        
        // Keep only the last maxPoints
        if (updated.length > maxPoints) {
          return updated.slice(updated.length - maxPoints);
        }
        return updated;
      });
    }
    
    frameRef.current = requestAnimationFrame(updateChart);
  }, [isPaused, maxPoints]);

  // Socket connection and data handling
  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);
    
    socketRef.current.on('connect', () => {
      setIsConnected(true);
    });
    
    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });
    
    socketRef.current.on('sensorData', (newData: string) => {
      if (!isPaused) {
        const value = parseFloat(newData);
        if (!isNaN(value)) {
          bufferRef.current.push(value);
        }
      }
    });
    
    frameRef.current = requestAnimationFrame(updateChart);
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      socketRef.current.disconnect();
    };
  }, [updateChart, isPaused]);
  
  // Update statistics when data changes
  useEffect(() => {
    setStats(calculateStats(dataPoints));
  }, [dataPoints, calculateStats]);
  
  // Clear all data
  const handleClearData = () => {
    setDataPoints([]);
    bufferRef.current = [];
  };
  
  // Export data as CSV
  const handleExportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + dataPoints.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sensor_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chart configuration
  const chartData = {
    labels: dataPoints.map((_, idx) => idx + 1),
    datasets: [
      {
        label: 'Sensor Value',
        data: dataPoints,
        fill: showArea,
        backgroundColor: 'rgba(34, 211, 238, 0.2)',
        borderColor: 'rgb(34, 211, 238)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: smoothing,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0 // Disable animations for better performance
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 10,
          display: true,
        },
      },
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(200, 200, 200, 0.1)',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">ESP32 Sensor Dashboard</h1>
              <p className="text-muted-foreground mt-1">Real-time sensor data visualization from your ESP32</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? "default" : "destructive"} className={isConnected ? "bg-green-500" : ""}>
                <ZapIcon className="w-3 h-3 mr-1" />
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? <PlayIcon className="h-4 w-4" /> : <PauseIcon className="h-4 w-4" />}
              </Button>
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleClearData}
              >
                <RefreshCwIcon className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleExportData}
              >
                <DownloadIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
                <CardDescription>Sensor data metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Current Value</p>
                    <p className="text-2xl font-bold">{stats.current.toFixed(2)}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Min</p>
                      <p className="text-lg font-semibold">{stats.min.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Max</p>
                      <p className="text-lg font-semibold">{stats.max.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avg</p>
                      <p className="text-lg font-semibold">{stats.avg.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Data Points</label>
                      <span className="text-sm text-muted-foreground">{maxPoints}</span>
                    </div>
                    <Slider 
                      value={[maxPoints]} 
                      min={50} 
                      max={500} 
                      step={50} 
                      onValueChange={(value: SetStateAction<number>[]) => setMaxPoints(value[0])} 
                    />
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
                      onValueChange={(value: number[]) => setSmoothing(value[0] / 10)} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Fill Area</label>
                    <Switch 
                      checked={showArea} 
                      onCheckedChange={setShowArea} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Sensor Data Visualization</CardTitle>
                <CardDescription>Real-time plot from ESP32</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
