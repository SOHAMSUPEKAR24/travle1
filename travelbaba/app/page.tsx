"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useEffect, useState } from "react"
import { dataStore, type Trip } from "@/lib/data-store"

export default function HomePage() {
  const [trips, setTrips] = useState<Trip[]>([])

  useEffect(() => {
    const loadTrips = () => {
      const allTrips = dataStore.getTrips()
      const featuredTrips = allTrips.filter((trip) => trip.featured).slice(0, 1) // Show only 1 featured trip
      setTrips(featuredTrips)
    }

    loadTrips()

    // Listen for storage changes to update when admin makes changes
    const handleStorageChange = () => {
      loadTrips()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const handleExploreTrips = () => {
    window.location.href = "/travel-with-us"
  }

  const handleCreateItinerary = () => {
    window.location.href = "/create-your-itinerary"
  }

  const handleBookTrip = (tripId: string) => {
    window.location.href = `/trip/${tripId}`
  }

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-beige via-tan to-gold opacity-90"
          style={{
            backgroundImage: `url('/indian-mountain-temples.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-bold text-deep-brown mb-6">
            Discover India's
            <span className="block text-gold">Hidden Treasures</span>
          </h1>
          <p className="text-xl md:text-2xl text-brown mb-8 leading-relaxed">
            Curated journeys, cultural immersions, and unforgettable experiences across the incredible landscapes of
            India
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleExploreTrips} size="lg" className="btn-primary text-lg px-8 py-4">
              <i className="fas fa-compass mr-2"></i>
              Explore Trips
            </Button>
            <Button
              onClick={handleCreateItinerary}
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4 border-2 border-gold text-gold hover:bg-gold hover:text-white bg-transparent"
            >
              <i className="fas fa-route mr-2"></i>
              Create Custom Itinerary
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <i className="fas fa-chevron-down text-2xl text-gold"></i>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-deep-brown to-brown relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-beige mb-4">Explore the World</h2>
            <p className="text-xl text-tan max-w-2xl mx-auto">
              Discover breathtaking destinations across the globe with our curated travel experiences
            </p>
          </div>

          <div className="flex justify-center">
            <div className="relative w-80 h-80 mx-auto">
              {/* Globe container */}
              <div className="globe-container relative w-full h-full rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 shadow-2xl overflow-hidden">
                {/* Rotating images */}
                <div className="rotating-images absolute inset-0">
                  <img
                    src="/goa-beach-sunset.png"
                    alt="Goa Beach"
                    className="absolute w-16 h-16 rounded-full object-cover shadow-lg animate-orbit-1"
                    style={{ top: "20%", left: "10%" }}
                  />
                  <img
                    src="/kashmir-valley-mountains.png"
                    alt="Kashmir Valley"
                    className="absolute w-12 h-12 rounded-full object-cover shadow-lg animate-orbit-2"
                    style={{ top: "60%", right: "15%" }}
                  />
                  <img
                    src="/ladakh-monastery-mountains.png"
                    alt="Ladakh"
                    className="absolute w-14 h-14 rounded-full object-cover shadow-lg animate-orbit-3"
                    style={{ bottom: "25%", left: "20%" }}
                  />
                  <img
                    src="/konkan-coast.png"
                    alt="Konkan Coast"
                    className="absolute w-10 h-10 rounded-full object-cover shadow-lg animate-orbit-4"
                    style={{ top: "40%", right: "30%" }}
                  />
                </div>

                {/* Globe shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Trips Section */}
      <section id="featured-trips" className="py-20 bg-soft-gray">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-deep-brown mb-4">Upcoming Adventures</h2>
            <p className="text-xl text-brown max-w-2xl mx-auto">
              Join our carefully curated journeys and create memories that last a lifetime
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trips.length > 0 ? (
              trips.map((trip) => (
                <Card key={trip.id} className="travel-card overflow-hidden">
                  <div className="relative h-48">
                    <img
                      src={trip.coverImage || "/placeholder.svg"}
                      alt={trip.title}
                      className="w-full h-full object-cover"
                    />
                    {trip.featured && (
                      <div className="absolute top-4 right-4 bg-gold text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Featured
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl">{trip.title}</CardTitle>
                    <CardDescription>{trip.subtitle}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-gold">₹{trip.price.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.ceil(
                          (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
                            (1000 * 60 * 60 * 24),
                        )}{" "}
                        days
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <i className="fas fa-calendar mr-2"></i>
                      {new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} -{" "}
                      {new Date(trip.endDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <Button onClick={() => handleBookTrip(trip.id)} className="w-full btn-primary">
                      View Details & Book
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              // Fallback content when no trips are available
              <div className="col-span-full text-center py-12">
                <p className="text-xl text-muted-foreground mb-4">No featured trips available at the moment.</p>
                <Link href="/admin">
                  <Button variant="outline">Add Trips in Admin Panel</Button>
                </Link>
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <Link href="/travel-with-us">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-gold text-gold hover:bg-gold hover:text-white bg-transparent"
              >
                View All Trips
                <i className="fas fa-arrow-right ml-2"></i>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-deep-brown mb-4">How It Works</h2>
            <p className="text-xl text-brown max-w-2xl mx-auto">Your journey to incredible experiences starts here</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-search text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-semibold text-deep-brown mb-2">Choose</h3>
              <p className="text-brown">Browse our curated trips and find your perfect adventure</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-calendar-check text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-semibold text-deep-brown mb-2">Book</h3>
              <p className="text-brown">Secure your spot with easy online booking and payment</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-plane text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-semibold text-deep-brown mb-2">Travel</h3>
              <p className="text-brown">Embark on your journey with expert guides and support</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-heart text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-semibold text-deep-brown mb-2">Enjoy</h3>
              <p className="text-brown">Create unforgettable memories and lifelong connections</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-soft-gray">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-deep-brown mb-4">What Our Travelers Say</h2>
            <p className="text-xl text-brown max-w-2xl mx-auto">Real experiences from real travelers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-beige/80 backdrop-blur-[10px] border border-tan/30 shadow-[0_8px_32px_rgba(93,78,55,0.1)]">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <img src="/happy-traveler.png" alt="Aarav Shah" className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <h4 className="font-semibold text-deep-brown">Aarav Shah</h4>
                    <p className="text-sm text-brown">Konkan-Goa Trip</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star text-gold"></i>
                  ))}
                </div>
                <p className="text-brown italic">
                  "Flawless planning and great hosts. The Konkan-Goa trip exceeded all expectations!"
                </p>
              </CardContent>
            </Card>

            <Card className="bg-beige/80 backdrop-blur-[10px] border border-tan/30 shadow-[0_8px_32px_rgba(93,78,55,0.1)]">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <img src="/female-traveler.png" alt="Priya Sharma" className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <h4 className="font-semibold text-deep-brown">Priya Sharma</h4>
                    <p className="text-sm text-brown">Kashmir Valley</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star text-gold"></i>
                  ))}
                </div>
                <p className="text-brown italic">
                  "Absolutely magical experience! Every detail was perfectly arranged."
                </p>
              </CardContent>
            </Card>

            <Card className="bg-beige/80 backdrop-blur-[10px] border border-tan/30 shadow-[0_8px_32px_rgba(93,78,55,0.1)]">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <img src="/male-traveler.png" alt="Rajesh Kumar" className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <h4 className="font-semibold text-deep-brown">Rajesh Kumar</h4>
                    <p className="text-sm text-brown">Ladakh Adventure</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star text-gold"></i>
                  ))}
                </div>
                <p className="text-brown italic">
                  "Life-changing journey! Professional team and incredible destinations."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
