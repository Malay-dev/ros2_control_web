/* eslint-disable @typescript-eslint/no-explicit-any */
const WS_URL = "ws://localhost:8765";

export function connectWebSocket(callback: (data: any) => void) {
  const socket = new WebSocket(WS_URL);

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("WebSocket message received:", data);
    callback(data);
  };

  socket.onerror = (error) => {
    console.error("WebSocket Error:", error);
  };

  return socket;
}
