"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import GraphLegend from "./GraphLegend";

interface GraphControlsProps {
  serverUrl: string;
  setServerUrl: (url: string) => void;
  connectionStatus: "connected" | "connecting" | "disconnected" | "error";
  zoomLevel: number;
  onConnect: () => void;
  onClearGraph: () => void;
  onRefreshGraph: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

const GraphControls = ({
  serverUrl,
  setServerUrl,
  connectionStatus,
  zoomLevel,
  onConnect,
  onClearGraph,
  onRefreshGraph,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: GraphControlsProps) => {
  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-500";
      case "connecting":
        return "bg-amber-500";
      case "disconnected":
        return "bg-red-500";
      case "error":
        return "bg-red-700";
      default:
        return "bg-gray-400";
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting...";
      case "disconnected":
        return "Disconnected";
      case "error":
        return "Connection Error";
      default:
        return "Unknown";
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Connection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div
                className={`h-3 w-3 rounded-full ${getConnectionStatusColor()}`}></div>
              <span className="text-sm">{getConnectionStatusText()}</span>
            </div>

            <div className="flex space-x-2">
              <Input
                type="text"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="WebSocket URL"
                className="text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={onConnect}
                className="border-gray-300 hover:bg-gray-100">
                Connect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Graph Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClearGraph}
              className="flex items-center justify-center border-gray-300 hover:bg-gray-100">
              <Trash2 className="h-4 w-4 mr-1" />
              Clear Graph
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onRefreshGraph}
              className="flex items-center justify-center border-gray-300 hover:bg-gray-100">
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>

          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              size="icon"
              onClick={onZoomOut}
              className="border-gray-300 hover:bg-gray-100">
              <ZoomOut className="h-4 w-4" />
            </Button>

            <div className="text-xs text-center">
              Zoom: {Math.round(zoomLevel * 100)}%
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={onZoomIn}
              className="border-gray-300 hover:bg-gray-100">
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onResetZoom}
            className="w-full mt-2 border-gray-300 hover:bg-gray-100">
            Reset View
          </Button>
        </CardContent>
      </Card>

      <GraphLegend />
    </>
  );
};

export default GraphControls;
