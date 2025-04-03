"use client";

import GraphStatic from "@/components/GraphStatic";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function StaticGraphPage() {
  return (
    <main className="flex flex-col items-center p-0 h-screen w-screen overflow-hidden">
      <div className="w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2">
          <h1 className="text-xl font-bold text-gray-800">
            ROS 2 Control Ecosystem Visualizer
          </h1>
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 hover:bg-gray-100">
              Switch to Dynamic View
            </Button>
          </Link>
        </div>
      </div>
      <GraphStatic />
    </main>
  );
}
