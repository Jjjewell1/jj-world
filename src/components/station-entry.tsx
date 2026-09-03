"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { heroContent } from "../lib/data";

export function StationEntry() {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <motion.div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "100%",
        maxWidth: "800px",
        padding: "40px 24px",
        textAlign: "center",
        color: "var(--foreground)",
      }}
    >
      <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tight text-gradient">
        {heroContent.title}
      </h1>

      <p className="text-xl sm:text-2xl md:text-3xl text-muted-foreground mb-8 max-w-2xl mx-auto">
        {heroContent.subtitle}
      </p>

      <p className="text-lg text-muted-foreground/60 mb-12 leading-relaxed">
        {heroContent.description}
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
        <Link href="#projects" 
          className="relative inline-flex items-center gap-2 rounded-lg border border-border bg-background px-8 py-3 text-sm font-medium hover:bg-muted transition-colors">
          <span className="gradient-text">View Projects</span>
          <ChevronRight className="h-4 w-4" />
        </Link>

        <Link href="#certifications" 
          className="relative inline-flex items-center gap-2 rounded-lg border border-border bg-background px-8 py-3 text-sm font-medium hover:bg-muted transition-colors">
          <span className="gradient-text">Certifications</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 text-muted-foreground/50">
        <span className="text-sm">Richlands, Virginia</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4 inline-block align-middle" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 18 12 12 18" />
        </svg>
      </div>
    </motion.div>
  );
}