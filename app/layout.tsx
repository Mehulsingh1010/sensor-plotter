import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
// import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ESP32 Sensor Dashboard',
  description: 'Real-time sensor data visualization from ESP32',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        
          {children}
        {/* </ThemeProvider> */}
      </body>
    </html>
  )
}
