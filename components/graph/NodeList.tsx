"use client";

import type { Node } from "@/lib/GraphTypes";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, Search } from "lucide-react";

interface NodeListProps {
  nodes: Node[];
  selectedNode: Node | null;
  setSelectedNode: (node: Node) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const NodeList = ({
  nodes,
  selectedNode,
  setSelectedNode,
  searchTerm,
  setSearchTerm,
}: NodeListProps) => {
  // Get node type badge color
  const getNodeTypeBadgeColor = (type: string) => {
    switch (type) {
      case "controller":
        return "bg-purple-500";
      case "hardware":
      case "actuator":
        return "bg-amber-500";
      case "joint":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <>
      <div className="flex items-center space-x-2 mb-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search nodes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-8 text-sm"
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            All Nodes ({nodes.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <div className="space-y-1 p-2">
              {nodes.length > 0 ? (
                nodes.map((node) => (
                  <div
                    key={node.id}
                    className={`p-2 rounded-md cursor-pointer transition-colors ${
                      selectedNode && selectedNode.id === node.id
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => setSelectedNode(node)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            node.metadata?.type
                              ? getNodeTypeBadgeColor(node.metadata.type)
                              : node.is_hardware
                              ? "bg-amber-500"
                              : "bg-gray-500"
                          }`}></div>
                        <span className="text-sm font-medium truncate max-w-[180px]">
                          {node.id.split("/").pop()}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                    {node.metadata?.type && (
                      <div className="ml-5 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {node.metadata.type}
                        </Badge>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-20 text-center text-gray-500">
                  <p className="text-sm">No nodes found</p>
                  <p className="text-xs mt-1">Try a different search term</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </>
  );
};

export default NodeList;
