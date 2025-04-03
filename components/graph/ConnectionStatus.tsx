"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface ConnectionStatusProps {
  onReconnect: () => void
}

const ConnectionStatus = ({ onReconnect }: ConnectionStatusProps) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10">
      <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-md border border-gray-200">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Connection Lost</h3>
        <p className="text-gray-600 mb-4">
          The connection to the WebSocket server has been lost. We&apos;re attempting to reconnect automatically.
        </p>
        <div className="flex justify-center space-x-4">
          <Button variant="outline" onClick={onReconnect}>
            Reconnect Now
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConnectionStatus

