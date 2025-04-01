"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const Graph = () => {
  const svgRef = useRef(null);
  const [data, setData] = useState([]);
  const [serverUrl, setServerUrl] = useState("ws://localhost:8765");
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const socketRef = useRef<WebSocket | null>(null);

  // WebSocket connection logic
  useEffect(() => {
    const connectWebSocket = () => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }

      const ws = new WebSocket(serverUrl);
      socketRef.current = ws;

      setConnectionStatus("Connecting...");

      ws.onopen = () => {
        setConnectionStatus("Connected");
        ws.send(JSON.stringify({ type: "get_graph" }));
      };

      ws.onclose = () => {
        setConnectionStatus("Disconnected");
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus("Error");
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (e) {
          console.error("Error parsing WebSocket message:", e);
        }
      };
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [serverUrl]);

  const handleWebSocketMessage = (message) => {
    if (!message.type) return;
    switch (message.type) {
      case "full_graph":
        const graphData = message.edges.map((edge) => ({
          start: edge.source,
          end: edge.target,
          command_interface: edge.command_interface,
          state_interface: edge.state_interface,
          metadata: edge.metadata,
          updated: false,
        }));
        setData(graphData); // Triggers full graph rendering
        break;

      case "edge_update":
        if (!message.edge) return;
        setData((prevData) => {
          const updatedData = [...prevData];
          const index = updatedData.findIndex(
            (edge) =>
              edge.start === message.edge.source &&
              edge.end === message.edge.target
          );
          if (index >= 0) {
            // Update the existing link and set `updated` to true
            updatedData[index] = { ...updatedData[index], updated: true };
          } else {
            // Add the new link and set `updated` to true
            updatedData.push({
              start: message.edge.source,
              end: message.edge.target,
              command_interface: message.edge.command_interface,
              state_interface: message.edge.state_interface,
              metadata: message.edge.metadata,
              updated: true,
            });
          }

          // Reset the `updated` property for all other links
          return updatedData.map((link) => ({
            ...link,
            updated:
              link.start === message.edge.source &&
              link.end === message.edge.target,
          }));
        });
        break;

      case "clear_graph":
        setData([]); // Clear the graph
        break;

      default:
        console.log("Unknown message type:", message.type);
    }
  };

  // D3 Graph Rendering
  useEffect(() => {
    const svg = d3
      .select(svgRef.current)
      .attr("width", "100%")
      .attr("height", "100%")
      .call(
        d3.zoom().on("zoom", (event) => {
          svg.select("g").attr("transform", event.transform);
        })
      );

    const container = svg.append("g");

    const width = svg.node().getBoundingClientRect().width;
    const height = svg.node().getBoundingClientRect().height;

    const simulation = d3
      .forceSimulation()
      .force(
        "link",
        d3
          .forceLink()
          .id((d) => d.id)
          .distance(150)
      )
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const renderNodes = () => {
      const nodes = Array.from(
        new Set(data.flatMap((d) => [d.start, d.end])),
        (id) => ({
          id,
          metadata: data.find((d) => d.start === id || d.end === id)?.metadata,
        })
      );

      const node = container
        .selectAll(".node")
        .data(nodes, (d) => d.id)
        .join(
          (enter) => {
            const nodeEnter = enter.append("g").attr("class", "node");

            nodeEnter
              .append("circle")
              .attr("r", 10)
              .style("fill", "blue")
              .style("stroke", "black")
              .style("stroke-width", 2);

            nodeEnter
              .append("text")
              .attr("dx", 12)
              .attr("dy", ".35em")
              .text((d) => d.id)
              .style("font-size", "12px")
              .style("fill", "black");

            return nodeEnter;
          },
          (update) => update,
          (exit) => exit.remove()
        );

      simulation.nodes(nodes);
    };

    const renderLinks = () => {
      const links = data.map((d) => ({
        source: d.start,
        target: d.end,
        command_interface: d.command_interface,
        state_interface: d.state_interface,
        metadata: d.metadata,
        updated: d.updated,
      }));

      const link = container
        .selectAll(".link")
        .data(links, (d) => `${d.source}-${d.target}`)
        .join(
          (enter) =>
            enter
              .append("line")
              .attr("class", "link")
              .style("stroke", (d) =>
                d.command_interface
                  ? "red"
                  : d.state_interface
                  ? "green"
                  : "black"
              )
              .style("stroke-width", 2)
              .style("stroke-dasharray", (d) => (d.updated ? "4 2" : "0")),
          (update) =>
            update.style("stroke-dasharray", (d) => (d.updated ? "4 2" : "0")),
          (exit) => exit.remove()
        );

      simulation.force("link").links(links);
    };

    simulation.on("tick", () => {
      container
        .selectAll(".node")
        .attr("transform", (d) => `translate(${d.x},${d.y})`);

      container
        .selectAll(".link")
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);
    });

    renderNodes();
    renderLinks();

    return () => {
      d3.select(svgRef.current).selectAll("*").remove();
    };
  }, [data]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="mb-4">
        <input
          type="text"
          value={serverUrl}
          onChange={(e) => setServerUrl(e.target.value)}
          placeholder="WebSocket URL"
          className="border p-2"
        />
        <span className="ml-4">{connectionStatus}</span>
      </div>
      <div className="mb-4">
        <button
          onClick={() => setData([])}
          className="bg-red-500 text-white px-4 py-2 rounded">
          Clear Graph
        </button>
        <button
          onClick={() => d3.select(svgRef.current).selectAll("*").remove()}
          className="bg-blue-500 text-white px-4 py-2 rounded ml-4">
          Reset Graph
        </button>
      </div>
      <svg
        className="max-h-dvh max-w-svw min-h-svh min-w-svw"
        ref={svgRef}></svg>
    </div>
  );
};

export default Graph;
