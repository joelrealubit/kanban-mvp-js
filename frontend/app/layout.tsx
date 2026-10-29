import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kanban — Project board",
  description: "A clear, calm space to move work forward.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
