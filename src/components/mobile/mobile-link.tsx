"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Smartphone } from "lucide-react"
import Link from "next/link"

export function MobileLink() {
  const [showMobileLink, setShowMobileLink] = useState(false)

  useEffect(() => {
    // Check if on desktop but could benefit from mobile version
    const checkDevice = () => {
      const width = window.innerWidth
      if (width < 768) {
        setShowMobileLink(true)
      }
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  if (!showMobileLink) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Link href="/mobile">
        <Button size="sm" variant="secondary" className="shadow-lg">
          <Smartphone className="h-4 w-4 mr-2" />
          Try Mobile Version
        </Button>
      </Link>
    </div>
  )
}