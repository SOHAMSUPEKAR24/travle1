"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookingModal } from "@/components/booking/booking-modal"
import { dataStore, type Trip } from "@/lib/data-store"

export default function TripDetailPage() {
  const params = useParams()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      const foundTrip = dataStore.getTripById(params.id as string)
      setTrip(foundTrip || null)
      setLoading(false)
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-gold mb-4"></i>
            <p className="text-muted-foreground">Loading trip details...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-6xl text-muted-foreground mb-6"></i>
            <h1 className="text-3xl font-bold text-foreground mb-4">Trip Not Found</h1>
            <p className="text-muted-foreground mb-8">The trip you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => window.history.back()} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const tripDuration = Math.ceil(
    (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24),
  )

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[60vh] overflow-hidden">
        <img src={trip.coverImage || "/placeholder.svg"} alt={trip.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-6 pb-12 text-white">
            <div className="flex flex-wrap gap-2 mb-4">
              {trip.categories.map((category) => (
                <Badge key={category} className="bg-gold text-white">
                  {category}
                </Badge>
              ))}
              {trip.featured && (
                <Badge className="bg-yellow text-deep-brown">
                  <i className="fas fa-star mr-1"></i>
                  Featured
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{trip.title}</h1>
            <p className="text-xl md:text-2xl mb-6">{trip.subtitle}</p>
            <div className="flex flex-wrap gap-6 text-lg">
              <div className="flex items-center">
                <i className="fas fa-map-marker-alt mr-2"></i>
                {trip.location}
              </div>
              <div className="flex items-center">
                <i className="fas fa-calendar mr-2"></i>
                {tripDuration} days
              </div>
              <div className="flex items-center">
                <i className="fas fa-users mr-2"></i>
                {trip.availableSeats} seats available
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Trip Details */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                  <TabsTrigger value="highlights">Highlights</TabsTrigger>
                  <TabsTrigger value="gallery">Gallery</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>About This Trip</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {trip.description ||
                          "Experience the perfect blend of culture, adventure, and natural beauty on this carefully curated journey. Our expert guides will take you through the most spectacular destinations while ensuring comfort and authenticity throughout your travel experience."}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Trip Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Duration</h4>
                          <p className="text-muted-foreground">{tripDuration} days</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Group Size</h4>
                          <p className="text-muted-foreground">Max {trip.capacity} travelers</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Start Date</h4>
                          <p className="text-muted-foreground">{new Date(trip.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">End Date</h4>
                          <p className="text-muted-foreground">{new Date(trip.endDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="itinerary" className="space-y-4">
                  {trip.itinerary.length > 0 ? (
                    trip.itinerary.map((day) => (
                      <Card key={day.day}>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            Day {day.day}: {day.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">{day.details}</p>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="text-center py-8">
                        <i className="fas fa-route text-4xl text-muted-foreground mb-4"></i>
                        <p className="text-muted-foreground">Detailed itinerary will be shared upon booking.</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="highlights" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Trip Highlights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {trip.highlights.map((highlight, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <i className="fas fa-check-circle text-gold"></i>
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="gallery" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <img
                      src={trip.coverImage || "/placeholder.svg"}
                      alt={trip.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    {trip.gallery.map((image, index) => (
                      <img
                        key={index}
                        src={image || "/placeholder.svg"}
                        alt={`${trip.title} - Image ${index + 1}`}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-2xl">Book This Trip</CardTitle>
                  <CardDescription>Secure your spot on this amazing journey</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gold">₹{trip.price.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">per person</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Available Seats</span>
                      <span className="font-semibold">{trip.availableSeats}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-semibold">{tripDuration} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start Date</span>
                      <span className="font-semibold">{new Date(trip.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full btn-primary text-lg py-6"
                    onClick={() => setIsBookingModalOpen(true)}
                    disabled={trip.availableSeats === 0}
                  >
                    {trip.availableSeats === 0 ? (
                      <>
                        <i className="fas fa-times mr-2"></i>
                        Fully Booked
                      </>
                    ) : (
                      <>
                        <i className="fas fa-calendar-check mr-2"></i>
                        Book Now
                      </>
                    )}
                  </Button>

                  {trip.mapUrl && (
                    <Button variant="outline" className="w-full bg-transparent" asChild>
                      <a href={trip.mapUrl} target="_blank" rel="noopener noreferrer">
                        <i className="fas fa-map mr-2"></i>
                        View on Map
                      </a>
                    </Button>
                  )}

                  <div className="text-center text-sm text-muted-foreground">
                    <i className="fas fa-shield-alt mr-1"></i>
                    Secure booking with instant confirmation
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <BookingModal trip={trip} isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />

      <Footer />
    </div>
  )
}
