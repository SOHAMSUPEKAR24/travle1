"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navigationItems = [
    { href: "/", label: "Home" },
    { href: "/blogs", label: "Blogs" },
    { href: "/travel-with-us", label: "Travel With Us" },
    {
      label: "More",
      items: [
        { href: "/maharashtra/diwali", label: "Diwali in Maharashtra" },
        { href: "/maharashtra/golden-triangle", label: "Golden Triangle" },
        { href: "/themes/konkan-goa", label: "Konkan-Goa" },
        { href: "/themes/spirituality", label: "Spirituality in India" },
        { href: "/destinations/kashmir", label: "Kashmir" },
        { href: "/destinations/ladakh", label: "Ladakh" },
        { href: "/create-your-itinerary", label: "Create Itinerary" },
        { href: "/about-us", label: "About Us" },
        { href: "/reviews", label: "Reviews" },
      ],
    },
  ]

  const handleBookNow = () => {
    // Scroll to featured trips section or navigate to booking page
    const tripsSection = document.getElementById("featured-trips")
    if (tripsSection) {
      tripsSection.scrollIntoView({ behavior: "smooth" })
    } else {
      window.location.href = "/travel-with-us"
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "py-2 px-4" : "py-4 px-6"
      }`}
    >
      <div
        className={`mx-auto transition-all duration-300 ${
          isScrolled ? "max-w-4xl nav-capsule" : "max-w-7xl bg-background/95 backdrop-blur-sm border-b border-border"
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-primary">
              <span className="text-gold">Travel</span>
              <span className="text-brown">Baba</span>
              <span className="text-gold">Voyage</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList className="space-x-1">
              {navigationItems.map((item, index) => (
                <NavigationMenuItem key={index}>
                  {item.items ? (
                    <>
                      <NavigationMenuTrigger className="text-sm font-medium">{item.label}</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="grid w-[400px] gap-3 p-4">
                          {item.items.map((subItem, subIndex) => (
                            <NavigationMenuLink key={subIndex} asChild>
                              <Link
                                href={subItem.href}
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              >
                                <div className="text-sm font-medium leading-none">{subItem.label}</div>
                              </Link>
                            </NavigationMenuLink>
                          ))}
                        </div>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <NavigationMenuLink asChild>
                      <Link
                        href={item.href}
                        className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                      >
                        {item.label}
                      </Link>
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* CTA and Social Links */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <Link href="https://instagram.com/travelbabavoyage" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram text-lg text-muted-foreground hover:text-primary transition-colors"></i>
              </Link>
              <Link href="https://facebook.com/travelbabavoyage" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook text-lg text-muted-foreground hover:text-primary transition-colors"></i>
              </Link>
            </div>

            <Button onClick={handleBookNow} className="btn-primary font-semibold">
              <i className="fas fa-calendar-check mr-2"></i>
              Book Now
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <i className="fas fa-bars"></i>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigationItems.map((item, index) => (
                    <div key={index}>
                      {item.items ? (
                        <div>
                          <div className="font-semibold text-foreground mb-2">{item.label}</div>
                          <div className="ml-4 space-y-2">
                            {item.items.map((subItem, subIndex) => (
                              <Link
                                key={subIndex}
                                href={subItem.href}
                                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {subItem.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          className="block text-foreground hover:text-primary transition-colors font-medium"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      )}
                    </div>
                  ))}

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center space-x-4">
                      <Link href="https://instagram.com/travelbabavoyage" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-instagram text-xl text-muted-foreground hover:text-primary transition-colors"></i>
                      </Link>
                      <Link href="https://facebook.com/travelbabavoyage" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-facebook text-xl text-muted-foreground hover:text-primary transition-colors"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
