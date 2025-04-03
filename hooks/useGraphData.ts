"use client"

import { useState, useMemo } from "react"
import type { Node, GraphData } from "@/lib/GraphTypes"

export const useGraphData = (searchTerm: string) => {
  const [data, setData] = useState<GraphData[]>([])
  const [allNodes, setAllNodes] = useState<Node[]>([])

  // Extract unique nodes with metadata from edges
  const extractNodesFromEdges = (edges: GraphData[]): Node[] => {
    const nodeMap = new Map<string, Node>()

    edges.forEach((edge) => {
      // Process start node
      if (!nodeMap.has(edge.start)) {
        nodeMap.set(edge.start, {
          id: edge.start,
          metadata: edge.metadata || {},
          is_hardware: edge.is_hardware || false,
          connections: [],
        })
      }

      // Process end node
      if (!nodeMap.has(edge.end)) {
        nodeMap.set(edge.end, {
          id: edge.end,
          metadata: edge.metadata || {},
          is_hardware: edge.is_hardware || false,
          connections: [],
        })
      }

      // Add connection info
      const startNode = nodeMap.get(edge.start)!
      if (!startNode.connections) {
        startNode.connections = []
      }
      startNode.connections.push({
        to: edge.end,
        command_interface: edge.command_interface,
        state_interface: edge.state_interface,
      })

      const endNode = nodeMap.get(edge.end)!
      if (!endNode.connections) {
        endNode.connections = []
      }
      endNode.connections.push({
        from: edge.start,
        command_interface: edge.command_interface,
        state_interface: edge.state_interface,
      })
    })

    return Array.from(nodeMap.values())
  }

  // Filter nodes based on search term
  const filteredNodes = useMemo(() => {
    return allNodes.filter(
      (node) =>
        node.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (node.metadata?.type && node.metadata.type.toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }, [allNodes, searchTerm])

  return {
    data,
    allNodes,
    filteredNodes,
    setData,
    setAllNodes,
    extractNodesFromEdges,
  }
}

