import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jeffrey JJ Jewell — IT Professional & Cybersecurity Student",
  description:
    "Self-hosted infrastructure, containerized services, CI/CD pipelines, and local AI tooling.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
