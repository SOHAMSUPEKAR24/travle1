import type React from "react"
import type { Metadata } from "next"
import { Inter, DM_Sans } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
})

export const metadata: Metadata = {
  title: "TravelBabaVoyage - Premium Travel Experiences",
  description: "Curated trips, cultural experiences, and custom itineraries across India and beyond",
  generator: "TravelBabaVoyage",
  keywords: "travel, india, maharashtra, goa, kashmir, ladakh, cultural tours, premium travel",
  authors: [{ name: "TravelBabaVoyage Team" }],
  openGraph: {
    title: "TravelBabaVoyage - Premium Travel Experiences",
    description: "Curated trips, cultural experiences, and custom itineraries",
    type: "website",
    locale: "en_IN",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSans.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className="font-sans antialiased">
        <div id="root">{children}</div>
      </body>
    </html>
  )
}
