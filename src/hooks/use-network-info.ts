"use client"

import { useState, useEffect } from "react"

interface NetworkInfo {
  isOnline: boolean
  effectiveType: "slow-2g" | "2g" | "3g" | "4g" | "5g" | "unknown"
  downlink?: number
  rtt?: number
  saveData?: boolean
  type?: "bluetooth" | "cellular" | "ethernet" | "none" | "wifi" | "wimax" | "other" | "unknown"
}

// Map effective types to display values
const NETWORK_TYPE_MAP = {
  "slow-2g": "2G",
  "2g": "2G", 
  "3g": "3G",
  "4g": "4G/LTE",
  "5g": "5G",
  "unknown": "Unknown"
}

export function useNetworkInfo(): NetworkInfo {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    effectiveType: "unknown"
  })

  useEffect(() => {
    if (typeof navigator === "undefined") return

    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection || 
                       (navigator as any).mozConnection || 
                       (navigator as any).webkitConnection

      const info: NetworkInfo = {
        isOnline: navigator.onLine,
        effectiveType: "unknown"
      }

      if (connection) {
        // Get effective type (2g, 3g, 4g)
        info.effectiveType = connection.effectiveType || "unknown"
        
        // Get additional network info
        info.downlink = connection.downlink // Mbps
        info.rtt = connection.rtt // Round trip time in ms
        info.saveData = connection.saveData // Data saver enabled
        info.type = connection.type || "unknown"
        
        // Attempt to detect 5G based on downlink speed
        // 5G typically has >100 Mbps downlink
        if (info.effectiveType === "4g" && info.downlink && info.downlink > 100) {
          info.effectiveType = "5g"
        }
      }

      setNetworkInfo(info)
    }

    // Initial check
    updateNetworkInfo()

    // Listen for online/offline events
    window.addEventListener("online", updateNetworkInfo)
    window.addEventListener("offline", updateNetworkInfo)

    // Listen for connection changes if available
    const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection
    
    if (connection) {
      connection.addEventListener("change", updateNetworkInfo)
    }

    return () => {
      window.removeEventListener("online", updateNetworkInfo)
      window.removeEventListener("offline", updateNetworkInfo)
      if (connection) {
        connection.removeEventListener("change", updateNetworkInfo)
      }
    }
  }, [])

  return networkInfo
}

export function getNetworkDisplayType(effectiveType: NetworkInfo["effectiveType"]): string {
  return NETWORK_TYPE_MAP[effectiveType] || "Unknown"
}

export function getNetworkQuality(info: NetworkInfo): "excellent" | "good" | "fair" | "poor" {
  if (!info.isOnline) return "poor"
  
  if (info.effectiveType === "5g" || info.effectiveType === "4g") {
    if (info.rtt && info.rtt < 50) return "excellent"
    return "good"
  }
  
  if (info.effectiveType === "3g") return "fair"
  
  return "poor"
}

export function shouldReduceDataUsage(info: NetworkInfo): boolean {
  return !info.isOnline || 
         info.saveData === true || 
         info.effectiveType === "slow-2g" || 
         info.effectiveType === "2g"
}