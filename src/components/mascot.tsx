"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface MascotProps {
  variant?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | "main"
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  animate?: boolean
}

export function Mascot({ variant = "main", size = "md", className, animate = true }: MascotProps) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  }

  const colors = {
    main: "oklch(0.68 0.15 220)", // Light blue matching the logo text
    1: "#4285F4",    // Microsoft Blue
    2: "#EA4335",    // Microsoft Red  
    3: "#34A853",    // Microsoft Green
    4: "#FBBC04",    // Microsoft Yellow
    5: "#1A73E8",    // Google Blue
    6: "#D33B27",    // Google Red
    7: "#F9AB00",    // Google Yellow
    8: "#0F9D58",    // Google Green
    9: "#9333EA",    // Purple Mix
    10: "#FB923C"    // Orange Mix
  }

  const bodyColor = colors[variant] || "#ffffff"

  return (
    <motion.div
      className={cn(sizes[size], className, "relative")}
      animate={animate ? {
        y: [0, -4, 0],
        rotate: [0, -5, 5, 0]
      } : undefined}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <svg
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Medical blob body */}
        <path
          d="m 3.6686793,5.6935837 c 0.888844,-0.6905 1.936846,-0.82028 2.85997,-0.85456 0,0 1.03576,-0.002 1.138602,0.007 0.844768,0.0416 1.897668,0.19099 2.7718197,0.90843 l 0.994134,-3.22237 c 0.142019,-0.66357 -0.293833,-0.89863 -0.484824,-0.9574 -2.5440997,-0.76640995 -5.2302197,-0.76640995 -7.7694227,0 -0.190991,0.0563 -0.64888,0.3526 -0.484824,0.95496 l 0.974545,3.16359 z m 2.240473,-3.35459 0.761516,0 0,-0.37463 c 0,-0.2669 0.215478,-0.48238 0.482376,-0.48238 0.266898,0 0.482375,0.21548 0.482375,0.48238 l 0,0.37463 0.761516,0 c 0.266898,0 0.482375,0.21548 0.482375,0.48238 0,0.2669 -0.215477,0.48237 -0.482375,0.48237 l -0.761516,0 0,0.37464 c 0,0.2669 -0.215477,0.48238 -0.482375,0.48238 -0.266898,0 -0.482376,-0.21548 -0.482376,-0.48238 l 0,-0.37708 -0.761516,0 c -0.266898,0 -0.482375,-0.21548 -0.482375,-0.4823799 0,-0.2644501 0.215477,-0.4799301 0.482375,-0.4799301 z m 6.2610827,9.2312403 c -0.384431,-0.33545 -0.910881,-0.79579 -0.979442,-1.49609 C 10.838194,6.4844838 9.3886203,5.9311038 7.5815493,5.8478538 c -0.03918,-0.01 -1.018619,-0.005 -1.018619,-0.005 -1.86094,0.0686 -3.366832,0.56563 -3.726777,4.2311902 -0.06856,0.70275 -0.604805,1.16308 -0.996582,1.49854 -0.306075,0.262 -0.619497,0.5338 -0.470132,0.93782 0.151814,0.40402 0.291384,0.48972 2.504923,0.48972 0.585216,0 5.800745,-0.01 6.3908577,-0.01 2.076417,0 2.21109,-0.0857 2.362904,-0.48238 0.154262,-0.40402 -0.156711,-0.67581 -0.457889,-0.93782 z"
          fill={variant === "main" ? "oklch(0.68 0.15 220)" : bodyColor}
          stroke="none"
          strokeWidth="0"
        />
        
        {/* Medical cross - white for main variant */}
        <path
          d="M 5.909,2.339 L 6.671,2.339 L 6.671,1.965 C 6.671,1.698 6.887,1.482 7.153,1.482 C 7.420,1.482 7.636,1.698 7.636,1.965 L 7.636,2.339 L 8.397,2.339 C 8.664,2.339 8.880,2.555 8.880,2.821 C 8.880,3.088 8.664,3.304 8.397,3.304 L 7.636,3.304 L 7.636,3.678 C 7.636,3.945 7.420,4.161 7.153,4.161 C 6.887,4.161 6.671,3.945 6.671,3.678 L 6.671,3.301 L 5.909,3.301 C 5.642,3.301 5.427,3.086 5.427,2.818 C 5.427,2.554 5.642,2.339 5.909,2.339"
          fill={variant === "main" ? "#ffffff" : bodyColor}
          stroke="none"
          strokeWidth="0"
        />
        
        {/* Eyes - white for main variant */}
        <circle cx="5.75" cy="9.0" r="0.65" fill={variant === "main" ? "#ffffff" : bodyColor}/>
        <circle cx="8.25" cy="9.0" r="0.65" fill={variant === "main" ? "#ffffff" : bodyColor}/>
        
        {/* Eye pupils - black for contrast */}
        <circle cx="5.75" cy="9.0" r="0.25" fill="#000000"/>
        <circle cx="8.25" cy="9.0" r="0.25" fill="#000000"/>
        
        {/* White eye glints for life */}
        <circle cx="5.9" cy="8.85" r="0.15" fill="#ffffff"/>
        <circle cx="8.4" cy="8.85" r="0.15" fill="#ffffff"/>

        {/* Smile - white for main variant */}
        <path 
          d="M 5.5,10.5 Q 7,11.8 8.5,10.5" 
          stroke={variant === "main" ? "#ffffff" : bodyColor}
          strokeWidth="0.35" 
          fill="none" 
          strokeLinecap="round" 
        />
      </svg>
    </motion.div>
  )
}

// Sparkle effect component
export function MascotSparkle({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0.5, 1.5, 0.5],
      }}
      transition={{
        duration: 2,
        delay,
        repeat: Infinity,
        repeatDelay: 3
      }}
    >
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <path
          d="M12 2L14.09 8.26L20.6 8.27L15.51 12.14L17.59 18.41L12 14.54L6.41 18.41L8.49 12.14L3.4 8.27L9.91 8.26L12 2Z"
          fill="#fbbf24"
          opacity="0.6"
        />
      </svg>
    </motion.div>
  )
}
