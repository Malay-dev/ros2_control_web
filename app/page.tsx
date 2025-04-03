"use client";

import Graph from "@/components/Graph";

export default function Home() {
  return (
    <main className="flex flex-col items-center p-0 h-screen w-screen overflow-hidden">
      <h1 className="text-xl font-bold py-2 bg-white w-full text-center border-b border-gray-200 shadow-sm text-gray-800">
        ROS 2 Control Ecosystem Visualizer
      </h1>
      <Graph />
    </main>
  );
}
