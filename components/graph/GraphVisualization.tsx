/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
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

interface GraphVisualizationProps {
  data: GraphData[];
  selectedNode: Node | null;
  setSelectedNode: (node: Node | null) => void;
  zoomLevel: number;
  onZoomChange: (zoomLevel: number) => void;
}

const GraphVisualization = ({
  data,
  selectedNode,
  setSelectedNode,
  zoomLevel,
  onZoomChange,
}: GraphVisualizationProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

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
    if (!svgRef.current) return;

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

    // Add a subtle grid pattern
    const gridSize = 50;
    const gridPattern = svg
      .append("defs")
      .append("pattern")
      .attr("id", "grid")
      .attr("width", gridSize)
      .attr("height", gridSize)
      .attr("patternUnits", "userSpaceOnUse");

    gridPattern
      .append("path")
      .attr("d", `M ${gridSize} 0 L 0 0 0 ${gridSize}`)
      .attr("fill", "none")
      .attr("stroke", "rgba(0, 0, 0, 0.07)")
      .attr("stroke-width", 1);

    svg
      .append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "url(#grid)")
      .on("click", () => {
        // Clear selection when clicking on the background
        setSelectedNode(null);
      });

    const width = svg.node()?.getBoundingClientRect().width || 0;
    const height = svg.node()?.getBoundingClientRect().height || 0;

    // Add arrow markers for directed edges
    svg
      .append("defs")
      .selectAll("marker")
      .data(["command", "state", "default"])
      .enter()
      .append("marker")
      .attr("id", (d) => `arrow-${d}`)
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

    // Create force simulation
    const simulation = d3
      .forceSimulation()
      .force(
        "link",
        d3
          .forceLink()
          .id((d) => (d as Node).id)
          .distance(150)
      )
      .force("charge", d3.forceManyBody().strength(-800))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(width / 2).strength(0.1))
      .force("y", d3.forceY(height / 2).strength(0.1));

    // Prepare nodes data
    const nodes = Array.from(
      new Set(data.flatMap((d) => [d.start, d.end])),
      (id) => {
        const edge = data.find((d) => d.start === id || d.end === id);
        return {
          id,
          metadata: edge?.metadata || {},
          is_hardware: edge?.is_hardware || false,
        };
      }
    );

    // Prepare links data
    const links: any = data.map((d) => ({
      source: d.start,
      target: d.end,
      command_interface: d.command_interface,
      state_interface: d.state_interface,
      metadata: d.metadata,
      updated: d.updated,
    }));

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

    // Create links
    const link = container
      .selectAll(".link")
      .data(links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("marker-end", (d: any) => {
        if (d.command_interface) return "url(#arrow-command)";
        if (d.state_interface) return "url(#arrow-state)";
        return "url(#arrow-default)";
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
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .call(
        d3
          .drag<SVGGElement, Node & d3.SimulationNodeDatum>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended) as any
      )
      .on("click", (event, d) => {
        event.stopPropagation();
        // Set the selected node
        setSelectedNode(d as any);
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
      .attr("r", (d) => getNodeSize(d as any) + 4)
      .style("fill", "none")
      .style("stroke", "#3b82f6")
      .style("stroke-width", 2)
      .style("opacity", (d) =>
        selectedNode && selectedNode.id === d.id ? 0.6 : 0
      )
      .style("pointer-events", "none");

    // Add node circle
    node
      .append("circle")
      .attr("class", "node-circle")
      .attr("r", (d: any) => getNodeSize(d))
      .style("fill", (d: any) => getNodeColor(d))
      .style("stroke", (d: any) =>
        selectedNode && selectedNode.id === d.id
          ? "#3b82f6"
          : (d3.color(getNodeColor(d)) as any).darker(0.5)
      )
      .style("stroke-width", (d: any) =>
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

    // Update node and link positions on simulation tick
    simulation.nodes(nodes as d3.SimulationNodeDatum[]).on("tick", () => {
      link.attr("d", (d: any) => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy);
        return `M${d.source.x},${d.source.y} A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      });

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });
    (
      simulation.force("link") as d3.ForceLink<
        d3.SimulationNodeDatum,
        d3.SimulationLinkDatum<d3.SimulationNodeDatum>
      >
    ).links(links as d3.SimulationLinkDatum<d3.SimulationNodeDatum>[]);

    // Drag functions
    function dragstarted(
      event: d3.D3DragEvent<SVGGElement, Node, any>,
      d: Node & d3.SimulationNodeDatum
    ) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(
      event: d3.D3DragEvent<SVGGElement, Node, any>,
      d: Node & d3.SimulationNodeDatum
    ) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(
      event: d3.D3DragEvent<SVGGElement, Node, any>,
      d: Node & d3.SimulationNodeDatum
    ) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Update selection when selectedNode changes
    if (selectedNode) {
      node
        .select(".selection-ring")
        .style("opacity", (d: any) => (d.id === selectedNode.id ? 0.6 : 0));

      node
        .select(".node-circle")
        .style("fill", (d: any) => getNodeColor(d))
        .style("stroke", (d: any) =>
          d.id === selectedNode.id
            ? "#3b82f6"
            : (d3.color(getNodeColor(d)) as any).darker(0.5)
        )
        .style("stroke-width", (d: any) => (d.id === selectedNode.id ? 3 : 2));
    }

    return () => {
      simulation.stop();
    };
  }, [data, selectedNode, onZoomChange]);

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

export default GraphVisualization;
