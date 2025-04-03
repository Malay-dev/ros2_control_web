"use client";

import { useState } from "react";
import type { Node, GraphData } from "@/lib/GraphTypes";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useGraphData } from "@/hooks/useGraphData";
import GraphControls from "@/components/graph/GraphControls";
import StaticGraphVisualization from "@/components/graph/StaticGraphVisualization";
import NodeList from "@/components/graph/NodeList";
import NodeDetails from "@/components/graph/NodeDetails";
import GraphStatistics from "@/components/graph/GraphStatistics";
import ConnectionStatus from "@/components/graph/ConnectionStatus";
import MobileNodePanel from "@/components/graph/MobileNodePanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { WebSocketMessage, WebSocketEdge } from "@/lib/GraphTypes";
import { Grid } from "lucide-react";
const Graph_Static = () => {
  const [serverUrl, setServerUrl] = useState("ws://localhost:8765");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Use custom hooks for WebSocket and graph data management
  const { connectionStatus, connect, sendMessage } = useWebSocket(
    serverUrl,
    handleWebSocketMessage
  );

  const {
    data,
    allNodes,
    setData,
    setAllNodes,
    extractNodesFromEdges,
    filteredNodes,
  } = useGraphData(searchTerm);

  // Handle WebSocket messages
  function handleWebSocketMessage(message: WebSocketMessage) {
    if (!message.type) return;

    switch (message.type) {
      case "full_graph":
        if (!message.edges) return;
        const graphData = message.edges.map((edge: WebSocketEdge) => {
          let parsedMetadata = {};
          if (edge.metadata) {
            try {
              parsedMetadata =
                typeof edge.metadata === "string"
                  ? JSON.parse(edge.metadata)
                  : edge.metadata;
            } catch (e) {
              console.error("Error parsing metadata JSON:", e);
            }
          }

          return {
            start: edge.source,
            end: edge.target,
            command_interface: edge.command_interface,
            state_interface: edge.state_interface,
            is_hardware: edge.is_hardware,
            metadata: parsedMetadata,
            updated: false,
          };
        });

        setData(graphData);
        const uniqueNodes = extractNodesFromEdges(graphData);
        setAllNodes(uniqueNodes);
        break;

      case "edge_update":
        setData((prevData: GraphData[]) => {
          const updatedData = [...prevData];
          const index = updatedData.findIndex(
            (edge) =>
              edge.start === message.edge!.source &&
              edge.end === message.edge!.target
          );

          // Parse the metadata JSON string if it exists
          let parsedMetadata = {};
          if (message.edge?.metadata) {
            try {
              parsedMetadata =
                typeof message.edge.metadata === "string"
                  ? JSON.parse(message.edge.metadata)
                  : message.edge.metadata;
            } catch (e) {
              console.error("Error parsing metadata JSON:", e);
            }
          }

          if (index >= 0) {
            // Update the existing link and set `updated` to true
            updatedData[index] = {
              ...updatedData[index],
              command_interface: message.edge!.command_interface,
              state_interface: message.edge!.state_interface,
              is_hardware: message.edge!.is_hardware,
              metadata: parsedMetadata,
              updated: true,
            };
          } else {
            // Add the new link and set `updated` to true
            updatedData.push({
              start: message.edge!.source,
              end: message.edge!.target,
              command_interface: message.edge!.command_interface,
              state_interface: message.edge!.state_interface,
              is_hardware: message.edge!.is_hardware,
              metadata: parsedMetadata,
              updated: true,
            });
          }

          // Reset the `updated` property for all other links
          const result = updatedData.map((link) => ({
            ...link,
            updated:
              link.start === message.edge!.source &&
              link.end === message.edge!.target,
          }));

          // Update all nodes when edges change
          const uniqueNodes = extractNodesFromEdges(result);
          setAllNodes(uniqueNodes);

          return result;
        });
        break;

      case "clear_graph":
        setData([]);
        setAllNodes([]);
        setSelectedNode(null);
        break;

      default:
        console.log("Unknown message type:", message.type);
    }
  }

  // Handle connection
  const handleConnect = () => {
    connect(serverUrl);
  };

  // Handle clear graph
  const handleClearGraph = () => {
    setData([]);
    setAllNodes([]);
    setSelectedNode(null);
  };

  // Handle refresh graph
  const handleRefreshGraph = () => {
    sendMessage({ type: "get_graph" });
  };

  // Handle zoom
  const handleZoomChange = (newZoomLevel: number) => {
    setZoomLevel(newZoomLevel);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-white">
      {/* Sidebar */}
      <div className="w-full md:w-96 p-4 border-b md:border-r border-gray-200 bg-white overflow-y-auto shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Static Graph View
          </h2>
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
            <Grid className="h-3.5 w-3.5" />
            Static Layout
          </Badge>
        </div>

        <Tabs defaultValue="controls">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="controls">Controls</TabsTrigger>
            <TabsTrigger value="info">Nodes</TabsTrigger>
          </TabsList>

          <TabsContent value="controls" className="space-y-4 mt-4">
            <GraphControls
              serverUrl={serverUrl}
              setServerUrl={setServerUrl}
              connectionStatus={connectionStatus}
              zoomLevel={zoomLevel}
              onConnect={handleConnect}
              onClearGraph={handleClearGraph}
              onRefreshGraph={handleRefreshGraph}
              onZoomIn={() => handleZoomChange(zoomLevel * 1.2)}
              onZoomOut={() => handleZoomChange(zoomLevel / 1.2)}
              onResetZoom={() => handleZoomChange(1)}
            />
          </TabsContent>

          <TabsContent value="info" className="space-y-4 mt-4">
            <NodeList
              nodes={filteredNodes}
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />

            {selectedNode && (
              <NodeDetails
                node={selectedNode}
                onClose={() => setSelectedNode(null)}
              />
            )}

            <GraphStatistics
              nodesCount={allNodes.length}
              connectionsCount={data.length}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Graph Area */}
      <div className="flex-1 relative bg-gray-50">
        <StaticGraphVisualization
          data={data}
          nodes={allNodes}
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
          zoomLevel={zoomLevel}
          onZoomChange={handleZoomChange}
        />

        {connectionStatus === "disconnected" && (
          <ConnectionStatus onReconnect={handleConnect} />
        )}

        {selectedNode && window.innerWidth < 768 && (
          <MobileNodePanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Graph_Static;
