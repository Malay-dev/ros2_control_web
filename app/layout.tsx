import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ROS 2 Control Ecosystem Visualizer",
  description: "Visualize the ROS 2 control ecosystem",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
