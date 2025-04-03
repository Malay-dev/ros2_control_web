"use client"

import type { Node } from "@/lib/GraphTypes"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface MobileNodePanelProps {
  node: Node
  onClose: () => void
}

const MobileNodePanel = ({ node, onClose }: MobileNodePanelProps) => {
  return (
    <div className="absolute bottom-4 left-4 right-4 z-20 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[40vh] overflow-y-auto">
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="font-medium">Selected Node</h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-3">
        <div className="text-sm font-medium mb-1">ID:</div>
        <div className="text-xs mb-3 font-mono break-all">{node.id}</div>

        {node.metadata?.type && (
          <div className="mb-3">
            <div className="text-sm font-medium mb-1">Type:</div>
            <Badge variant="outline">{node.metadata.type}</Badge>
          </div>
        )}

        {Object.entries(node.metadata || {}).filter(([key]) => key !== "type").length > 0 && (
          <div>
            <div className="text-sm font-medium mb-1">Properties:</div>
            <div className="space-y-1">
              {Object.entries(node.metadata || {})
                .filter(([key]) => key !== "type")
                .map(([key, value]) => (
                  <div key={key} className="text-xs">
                    <span className="font-medium">{key}:</span> {String(value)}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MobileNodePanel

