"use client"

import type { Node } from "@/lib/GraphTypes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface NodeDetailsProps {
  node: Node
  onClose: () => void
}

const NodeDetails = ({ node, onClose }: NodeDetailsProps) => {
  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Node Details</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
            <h3 className="text-xs font-semibold text-blue-800 mb-1">Node Identifier</h3>
            <p className="text-sm break-all font-mono">{node.id}</p>
          </div>

          {node.metadata?.type && (
            <div className="flex items-center">
              <div
                className={`h-3 w-3 rounded-full mr-2 ${
                  node.metadata.type === "controller"
                    ? "bg-purple-500"
                    : node.metadata.type === "hardware" || node.metadata.type === "actuator"
                      ? "bg-amber-500"
                      : node.metadata.type === "joint"
                        ? "bg-green-500"
                        : "bg-gray-500"
                }`}
              ></div>
              <span className="text-sm font-medium">Type:</span>
              <Badge variant="outline" className="ml-2">
                {node.metadata.type}
              </Badge>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500">Metadata Properties</h3>

            {Object.entries(node.metadata || {}).filter(([key]) => key !== "type").length > 0 ? (
              <div className="grid gap-2">
                {Object.entries(node.metadata || {})
                  .filter(([key]) => key !== "type")
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className="grid grid-cols-3 gap-2 text-sm border-b border-gray-100 dark:border-gray-800 pb-2"
                    >
                      <span className="font-medium text-gray-700">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                      <span className="col-span-2 break-all">{String(value)}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">No additional metadata available</div>
            )}
          </div>

          {node.is_hardware && !node.metadata?.type && (
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-amber-500 mr-2"></div>
              <span className="text-sm">Hardware Component</span>
            </div>
          )}

          {/* Connections */}
          {node.connections && node.connections.length > 0 && (
            <div className="pt-2">
              <h3 className="text-xs font-semibold text-gray-500 mb-2">Connections</h3>
              <div className="max-h-40 overflow-y-auto space-y-1 border rounded-md p-2">
                {node.connections.map((conn, index) => (
                  <div key={index} className="text-xs p-1 hover:bg-gray-100 rounded flex items-center justify-between">
                    <div className="flex items-center">
                      {conn.from ? (
                        <span className="text-gray-600">
                          <span className="font-medium">From:</span> {conn.from.split("/").pop()}
                        </span>
                      ) : (
                        <span className="text-gray-600">
                          <span className="font-medium">To:</span> {conn.to!.split("/").pop()}
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      {conn.command_interface && (
                        <Badge variant="outline" className="text-[10px] h-4 bg-red-50 text-red-700 border-red-200">
                          CMD
                        </Badge>
                      )}
                      {conn.state_interface && (
                        <Badge
                          variant="outline"
                          className="text-[10px] h-4 bg-green-50 text-green-700 border-green-200"
                        >
                          STATE
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default NodeDetails

