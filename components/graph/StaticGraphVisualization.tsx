/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import type { Node, GraphData } from "@/lib/GraphTypes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { RefreshCw, ZoomIn, ZoomOut } from "lucide-react";

interface StaticGraphVisualizationProps {
  data: GraphData[];
  nodes: Node[];
  selectedNode: Node | null;
  setSelectedNode: (node: Node | null) => void;
  zoomLevel: number;
  onZoomChange: (zoomLevel: number) => void;
}

interface NodeWithPosition extends Node {
  x: number;
  y: number;
}

const StaticGraphVisualization = ({
  data,
  nodes,
  selectedNode,
  setSelectedNode,
  onZoomChange,
}: StaticGraphVisualizationProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Generate static positions for nodes
  const nodesWithPositions = useMemo(() => {
    if (!svgRef.current) return [];

    const width = svgRef.current.getBoundingClientRect().width || 800;
    const height = svgRef.current.getBoundingClientRect().height || 600;

    // Organize nodes by type for better layout
    const controllers: Node[] = [];
    const hardware: Node[] = [];
    const joints: Node[] = [];
    const others: Node[] = [];

    nodes.forEach((node) => {
      if (node.metadata?.type === "controller") {
        controllers.push(node);
      } else if (
        node.metadata?.type === "hardware" ||
        node.metadata?.type === "actuator" ||
        node.is_hardware
      ) {
        hardware.push(node);
      } else if (node.metadata?.type === "joint") {
        joints.push(node);
      } else {
        others.push(node);
      }
    });

    const positionedNodes: NodeWithPosition[] = [];

    // Position controllers at the top
    const controllerWidth = width * 0.8;
    const controllerSpacing =
      controllers.length > 1 ? controllerWidth / (controllers.length - 1) : 0;
    controllers.forEach((node, i) => {
      positionedNodes.push({
        ...node,
        x:
          width * 0.1 +
          (controllers.length > 1
            ? i * controllerSpacing
            : controllerWidth / 2),
        y: height * 0.15,
      });
    });

    // Position hardware in the middle-left
    const hardwareHeight = height * 0.5;
    const hardwareSpacing =
      hardware.length > 1 ? hardwareHeight / (hardware.length - 1) : 0;
    hardware.forEach((node, i) => {
      positionedNodes.push({
        ...node,
        x: width * 0.25,
        y:
          height * 0.25 +
          (hardware.length > 1 ? i * hardwareSpacing : hardwareHeight / 2),
      });
    });

    // Position joints in the middle-right
    const jointHeight = height * 0.5;
    const jointSpacing =
      joints.length > 1 ? jointHeight / (joints.length - 1) : 0;
    joints.forEach((node, i) => {
      positionedNodes.push({
        ...node,
        x: width * 0.75,
        y:
          height * 0.25 +
          (joints.length > 1 ? i * jointSpacing : jointHeight / 2),
      });
    });

    // Position others at the bottom in a grid
    const othersPerRow = Math.ceil(Math.sqrt(others.length));
    const otherWidth = width * 0.8;
    const otherHeight = height * 0.2;
    const otherHSpacing =
      othersPerRow > 1 ? otherWidth / (othersPerRow - 1) : 0;
    const otherVSpacing = Math.min(
      30,
      otherHeight / Math.ceil(others.length / othersPerRow)
    );

    others.forEach((node, i) => {
      const row = Math.floor(i / othersPerRow);
      const col = i % othersPerRow;
      positionedNodes.push({
        ...node,
        x:
          width * 0.1 +
          (othersPerRow > 1 ? col * otherHSpacing : otherWidth / 2),
        y: height * 0.8 + row * otherVSpacing,
      });
    });

    return positionedNodes;
  }, [
    nodes,
    svgRef.current?.getBoundingClientRect().width,
    svgRef.current?.getBoundingClientRect().height,
  ]);

  const handleZoomIn = () => {
    const svg = d3.select(svgRef.current);
    const currentTransform = d3.zoomTransform(svg.node() as Element);
    (svg as unknown as d3.Selection<Element, unknown, null, undefined>).call(
      d3.zoom().transform,
      d3.zoomIdentity
        .translate(currentTransform.x, currentTransform.y)
        .scale(currentTransform.k * 1.2)
    );
    onZoomChange(currentTransform.k * 1.2);
  };

  const handleZoomOut = () => {
    const svg = d3.select(svgRef.current);
    const currentTransform = d3.zoomTransform(svg.node() as Element);
    (svg as unknown as d3.Selection<Element, unknown, null, undefined>).call(
      d3.zoom().transform,
      d3.zoomIdentity
        .translate(currentTransform.x, currentTransform.y)
        .scale(currentTransform.k / 1.2)
    );
    onZoomChange(currentTransform.k / 1.2);
  };

  const handleResetZoom = () => {
    const svg = d3.select(svgRef.current);
    (svg as unknown as d3.Selection<Element, unknown, null, undefined>).call(
      d3.zoom().transform,
      d3.zoomIdentity
    );
    onZoomChange(1);
  };

  // D3 Graph Rendering
  useEffect(() => {
    if (!svgRef.current || nodesWithPositions.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", "100%")
      .attr("height", "100%");

    // Add zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
        onZoomChange(event.transform.k);
      });

    svg.call(zoom);

    const container = svg.append("g");

    // Add a grid pattern (different from dynamic graph)
    const gridSize = 40;
    const gridPattern = svg
      .append("defs")
      .append("pattern")
      .attr("id", "grid")
      .attr("width", gridSize)
      .attr("height", gridSize)
      .attr("patternUnits", "userSpaceOnUse");

    // Create a more structured grid for static layout
    gridPattern
      .append("rect")
      .attr("width", gridSize)
      .attr("height", gridSize)
      .attr("fill", "none")
      .attr("stroke", "rgba(0, 0, 0, 0.05)")
      .attr("stroke-width", 1);

    gridPattern
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", gridSize)
      .attr("y2", gridSize)
      .attr("stroke", "rgba(0, 0, 0, 0.03)")
      .attr("stroke-width", 0.5);

    gridPattern
      .append("line")
      .attr("x1", gridSize)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", gridSize)
      .attr("stroke", "rgba(0, 0, 0, 0.03)")
      .attr("stroke-width", 0.5);

    svg
      .append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "url(#grid)")
      .attr("class", "bg-blue-50/30") // Light blue tint to distinguish from dynamic graph
      .on("click", () => {
        // Clear selection when clicking on the background
        setSelectedNode(null);
      });

    // Add arrow markers for directed edges
    svg
      .append("defs")
      .selectAll("marker")
      .data(["command", "state", "default"])
      .enter()
      .append("marker")
      .attr("id", (d) => `arrow-static-${d}`)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", (d) =>
        d === "command" ? "#ef4444" : d === "state" ? "#10b981" : "#6b7280"
      );

    // Helper function to get node color
    const getNodeColor = (d: Node) => {
      // Check if this is the selected node
      if (selectedNode && selectedNode.id === d.id) {
        return "#3b82f6"; // Bright blue for selected node
      }

      // Default node coloring logic
      if (d.metadata && d.metadata.type) {
        switch (d.metadata.type) {
          case "controller":
            return "#8b5cf6"; // Purple for controllers
          case "hardware":
          case "actuator":
            return "#f59e0b"; // Amber for hardware/actuators
          case "joint":
            return "#10b981"; // Green for joints
          default:
            return "#6b7280"; // Gray for unknown types
        }
      }

      // Use is_hardware flag as fallback
      if (d.is_hardware) {
        return "#f59e0b"; // Amber for hardware
      }

      return "#6b7280"; // Default gray
    };

    // Helper function to get node size
    const getNodeSize = (d: Node) => {
      if (selectedNode && selectedNode.id === d.id) {
        return 14; // Larger for selected node
      }

      if (d.metadata && d.metadata.type) {
        switch (d.metadata.type) {
          case "controller":
            return 10;
          case "hardware":
          case "actuator":
            return 10;
          case "joint":
            return 8;
          default:
            return 8;
        }
      }
      return 8; // Default size
    };

    // Create a map of node IDs to positions for edge drawing
    const nodePositions = new Map<string, { x: number; y: number }>();
    nodesWithPositions.forEach((node) => {
      nodePositions.set(node.id, { x: node.x, y: node.y });
    });

    // Create links
    const links = data
      .map((d) => {
        const sourcePos = nodePositions.get(d.start);
        const targetPos = nodePositions.get(d.end);

        if (!sourcePos || !targetPos) return null;

        return {
          source: sourcePos,
          target: targetPos,
          command_interface: d.command_interface,
          state_interface: d.state_interface,
          updated: d.updated,
          id: `${d.start}-${d.end}`,
        };
      })
      .filter((d) => d !== null);

    // Draw the links
    container
      .selectAll(".link")
      .data(links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", (d: any) => {
        // Use a straight line with a slight curve for static layout
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 2; // Larger curve radius for static layout
        return `M${d.source.x},${d.source.y} A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      })
      .attr("marker-end", (d: any) => {
        if (d.command_interface) return "url(#arrow-static-command)";
        if (d.state_interface) return "url(#arrow-static-state)";
        return "url(#arrow-static-default)";
      })
      .style(
        "stroke",
        (d: any) =>
          d.command_interface
            ? "#ef4444" // Red for command interface
            : d.state_interface
            ? "#10b981" // Green for state interface
            : "#6b7280" // Gray for default
      )
      .style("stroke-width", 2)
      .style("stroke-dasharray", (d: any) => (d.updated ? "4 2" : "0"))
      .style("fill", "none")
      .style("opacity", 0.7)
      .style("cursor", "pointer")
      .on("mouseover", (event) => {
        d3.select(event.currentTarget)
          .style("stroke-width", 3)
          .style("opacity", 1);
      })
      .on("mouseout", (event) => {
        d3.select(event.currentTarget)
          .style("stroke-width", 2)
          .style("opacity", 0.7);
      });

    // Create nodes
    const node = container
      .selectAll(".node")
      .data(nodesWithPositions)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x},${d.y})`)
      .on("click", (event, d) => {
        event.stopPropagation();
        // Set the selected node
        setSelectedNode(d);
      })
      .on("mouseover", (event) => {
        d3.select(event.currentTarget).style("cursor", "pointer");
      })
      .on("mouseout", (event) => {
        d3.select(event.currentTarget).style("cursor", "default");
      });

    // Add selection ring
    node
      .append("circle")
      .attr("class", "selection-ring")
      .attr("r", (d) => getNodeSize(d) + 4)
      .style("fill", "none")
      .style("stroke", "#3b82f6")
      .style("stroke-width", 2)
      .style("opacity", (d) =>
        selectedNode && selectedNode.id === d.id ? 0.6 : 0
      )
      .style("pointer-events", "none");

    // Add node circle with square shape to distinguish from dynamic graph
    node
      .append("rect")
      .attr("class", "node-rect")
      .attr("width", (d) => getNodeSize(d) * 1.8)
      .attr("height", (d) => getNodeSize(d) * 1.8)
      .attr("x", (d) => -getNodeSize(d) * 0.9)
      .attr("y", (d) => -getNodeSize(d) * 0.9)
      .attr("rx", 3) // Rounded corners
      .style("fill", (d) => getNodeColor(d))
      .style("stroke", (d) =>
        selectedNode && selectedNode.id === d.id
          ? "#3b82f6"
          : (d3.color(getNodeColor(d)) as any).darker(0.5)
      )
      .style("stroke-width", (d) =>
        selectedNode && selectedNode.id === d.id ? 3 : 2
      );

    // Add node label
    node
      .append("text")
      .attr("dx", 12)
      .attr("dy", ".35em")
      .text((d: any) => d.id.split("/").pop())
      .style("font-size", "10px")
      .style("fill", "#374151")
      .style("pointer-events", "none")
      .style(
        "text-shadow",
        "0 1px 0 rgba(255, 255, 255, 1), 0 -1px 0 rgba(255, 255, 255, 1), 1px 0 0 rgba(255, 255, 255, 1), -1px 0 0 rgba(255, 255, 255, 1)"
      );

    // Add type labels for better identification in static layout
    node
      .filter((d: any) => d.metadata?.type)
      .append("text")
      .attr("dx", 12)
      .attr("dy", "1.5em")
      .text((d) => d.metadata?.type || "")
      .style("font-size", "8px")
      .style("fill", "#666")
      .style("font-style", "italic")
      .style("pointer-events", "none")
      .style(
        "text-shadow",
        "0 1px 0 rgba(255, 255, 255, 1), 0 -1px 0 rgba(255, 255, 255, 1), 1px 0 0 rgba(255, 255, 255, 1), -1px 0 0 rgba(255, 255, 255, 1)"
      );

    // Update selection when selectedNode changes
    if (selectedNode) {
      node
        .select(".selection-ring")
        .style("opacity", (d) => (d.id === selectedNode.id ? 0.6 : 0));

      node
        .select(".node-rect")
        .style("fill", (d) => getNodeColor(d))
        .style("stroke", (d) =>
          d.id === selectedNode.id
            ? "#3b82f6"
            : (d3.color(getNodeColor(d)) as any).darker(0.5)
        )
        .style("stroke-width", (d) => (d.id === selectedNode.id ? 3 : 2));
    }

    // Add section labels for the layout
    if (nodesWithPositions.some((n) => n.metadata?.type === "controller")) {
      container
        .append("text")
        .attr(
          "x",
          svg.node()?.getBoundingClientRect().width
            ? svg.node()!.getBoundingClientRect().width * 0.5
            : 400
        )
        .attr(
          "y",
          svg.node()?.getBoundingClientRect().height
            ? svg.node()!.getBoundingClientRect().height * 0.08
            : 50
        )
        .attr("text-anchor", "middle")
        .text("Controllers")
        .style("font-size", "14px")
        .style("fill", "#666")
        .style("font-weight", "bold");
    }

    if (
      nodesWithPositions.some(
        (n) =>
          n.metadata?.type === "hardware" ||
          n.metadata?.type === "actuator" ||
          n.is_hardware
      )
    ) {
      container
        .append("text")
        .attr(
          "x",
          svg.node()?.getBoundingClientRect().width
            ? svg.node()!.getBoundingClientRect().width * 0.25
            : 200
        )
        .attr(
          "y",
          svg.node()?.getBoundingClientRect().height
            ? svg.node()!.getBoundingClientRect().height * 0.2
            : 120
        )
        .attr("text-anchor", "middle")
        .text("Hardware")
        .style("font-size", "14px")
        .style("fill", "#666")
        .style("font-weight", "bold");
    }

    if (nodesWithPositions.some((n) => n.metadata?.type === "joint")) {
      container
        .append("text")
        .attr(
          "x",
          svg.node()?.getBoundingClientRect().width
            ? svg.node()!.getBoundingClientRect().width * 0.75
            : 600
        )
        .attr(
          "y",
          svg.node()?.getBoundingClientRect().height
            ? svg.node()!.getBoundingClientRect().height * 0.2
            : 120
        )
        .attr("text-anchor", "middle")
        .text("Joints")
        .style("font-size", "14px")
        .style("fill", "#666")
        .style("font-weight", "bold");
    }

    return () => {
      // Cleanup
    };
  }, [nodesWithPositions, data, selectedNode, onZoomChange]);

  return (
    <>
      <TooltipProvider>
        <div className="absolute top-4 right-4 z-10 flex space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="bg-white shadow-sm border-gray-300"
                onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Zoom In</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="bg-white shadow-sm border-gray-300"
                onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Zoom Out</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="bg-white shadow-sm border-gray-300"
                onClick={handleResetZoom}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reset View</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <svg ref={svgRef} className="w-full h-full"></svg>
    </>
  );
};

export default StaticGraphVisualization;
