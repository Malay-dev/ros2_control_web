// GraphTypes.ts - Enhanced type definitions for the graph component
import * as d3 from "d3";

export interface Connection {
  to?: string;
  from?: string;
  command_interface?: boolean;
  state_interface?: boolean;
}

// Node interface extending D3's SimulationNodeDatum to ensure compatibility
export interface Node extends d3.SimulationNodeDatum {
  id: string;
  metadata: Record<string, string>;
  is_hardware?: boolean;
  connections: Connection[];
}

export interface GraphData {
  start: string;
  end: string;
  command_interface?: boolean;
  state_interface?: boolean;
  is_hardware?: boolean;
  metadata: Record<string, string>;
  updated: boolean;
}

// Link interface extending D3's SimulationLinkDatum to ensure compatibility
export interface SimulationLink extends d3.SimulationLinkDatum<Node> {
  command_interface?: boolean;
  state_interface?: boolean;
  metadata?: Record<string, string>;
  updated?: boolean;
  // Override source and target to be more specific
  source: string | Node;
  target: string | Node;
}

export interface WebSocketEdge {
  source: string;
  target: string;
  command_interface?: boolean;
  state_interface?: boolean;
  is_hardware?: boolean;
  metadata?: Record<string, string> | string;
}

export interface WebSocketMessage {
  type: string;
  edges?: WebSocketEdge[];
  edge?: WebSocketEdge;
}

