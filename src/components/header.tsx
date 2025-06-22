"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MoonIcon, SunIcon, MessageCircle } from "lucide-react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { Mascot } from "@/components/mascot"
import Image from "next/image"
import { useChat } from "@/contexts/chat-context"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function Header() {
  const { theme, setTheme } = useTheme()
  const { setIsOpen, isAnalysisComplete } = useChat()

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/85">
      <div className="container flex h-20 items-center">
        <motion.div 
          className="mr-6 flex"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link className="group flex items-center space-x-4 transition-all hover:scale-105" href="/">
            <div className="relative">
              <Image src="/10th.svg" className="w-18 h-18 ml-2" alt="10th Opinion Logo" width={40} height={40} />
            </div>
            <div className="flex flex-col space-y-0">
              <span className="text-2xl font-black bg-gradient-to-r from-[var(--tenth-blue)] via-[var(--tenth-blue)] to-[var(--color-agent-5)] bg-clip-text text-transparent tracking-tight tenth-heading-3">
                10TH OPINION
              </span>
              <span className="text-xs text-muted-foreground font-medium tracking-wider uppercase">
                10 opinions are better than one
              </span>
            </div>
          </Link>
        </motion.div>
        
        <div className="flex flex-1 items-center justify-end gap-6">
          {/* AI Medical Assistant Chat Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  className="chat-button-wrapper"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    onClick={() => {
                      console.log('Talk to Tentin clicked')
                      setIsOpen(true)
                    }}
                    className="chat-button"
                    aria-label="Talk to Tentin - AI Medical Assistant"
                  >
                    <Image
                      src="/tentin-mascot-32x32.png"
                      alt="Tentin"
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                    <span className="chat-text">
                      Talk to Tentin
                    </span>
                    <MessageCircle className="h-4 w-4 text-blue-500/60 ml-1" />
                    {isAnalysisComplete && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="chat-notification"
                      />
                    )}
                  </button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Chat with Tentin about your medical analysis</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Theme toggle */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="relative overflow-hidden hover:bg-[var(--tenth-blue)]/10 transition-all duration-300 rounded-xl w-10 h-10"
            >
              <motion.div
                animate={{ rotate: theme === "dark" ? 180 : 0 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                <SunIcon className="h-[1.4rem] w-[1.4rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
                <MoonIcon className="absolute h-[1.4rem] w-[1.4rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </motion.div>
              <span className="sr-only">Toggle theme</span>
            </Button>
          </motion.div>
        </div>
      </div>
    </header>
  )
}
