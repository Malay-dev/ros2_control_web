"use client"

import { useEffect, useRef, useState } from "react"

export const useWebSocket = (serverUrl: string, onMessage: (message: any) => void) => {
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected" | "error">(
    "disconnected",
  )
  const socketRef = useRef<WebSocket | null>(null)

  // Connect to WebSocket
  const connect = (url: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.close()
    }

    const ws = new WebSocket(url)
    socketRef.current = ws

    setConnectionStatus("connecting")

    ws.onopen = () => {
      setConnectionStatus("connected")
      ws.send(JSON.stringify({ type: "get_graph" }))
    }

    ws.onclose = () => {
      setConnectionStatus("disconnected")
      setTimeout(() => connect(url), 5000)
    }

    ws.onerror = (error) => {
      console.error("WebSocket error:", error)
      setConnectionStatus("error")
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        onMessage(message)
      } catch (e) {
        console.error("Error parsing WebSocket message:", e)
      }
    }
  }

  // Connect on mount
  useEffect(() => {
    connect(serverUrl)

    return () => {
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [serverUrl])

  // Send message
  const sendMessage = (message: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message))
    }
  }

  return {
    connectionStatus,
    connect,
    sendMessage,
  }
}

