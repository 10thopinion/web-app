import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "10th Opinion Mobile - AI Medical Analysis",
  description: "Get comprehensive AI medical analysis on your mobile device using 4G/5G networks",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
}

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mobile-app">
      {children}
    </div>
  )
}