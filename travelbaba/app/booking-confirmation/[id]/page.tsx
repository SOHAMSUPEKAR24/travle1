"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { dataStore, type Booking, type Trip } from "@/lib/data-store"

export default function BookingConfirmationPage() {
  const params = useParams()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      const bookings = dataStore.getBookings()
      const foundBooking = bookings.find((b) => b.id === params.id)

      if (foundBooking) {
        setBooking(foundBooking)
        const foundTrip = dataStore.getTripById(foundBooking.tripId)
        setTrip(foundTrip || null)
      }

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
            <p className="text-muted-foreground">Loading booking details...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!booking || !trip) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-6xl text-muted-foreground mb-6"></i>
            <h1 className="text-3xl font-bold text-foreground mb-4">Booking Not Found</h1>
            <p className="text-muted-foreground mb-8">The booking you're looking for doesn't exist.</p>
            <Link href="/travel-with-us">
              <Button variant="outline">Browse Trips</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const getStatusColor = (status: Booking["paymentStatus"]) => {
    switch (status) {
      case "completed":
        return "default"
      case "pending":
        return "secondary"
      case "failed":
        return "destructive"
      case "refunded":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      <section className="py-16 bg-soft-gray">
        <div className="max-w-4xl mx-auto px-6">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-check text-3xl text-green-600"></i>
            </div>
            <h1 className="text-4xl font-bold text-deep-brown mb-4">Booking Confirmed!</h1>
            <p className="text-xl text-brown">Thank you for choosing TravelBabaVoyage. Your adventure awaits!</p>
          </div>

          {/* Booking Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Trip Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-route mr-2 text-gold"></i>
                  Trip Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <img
                    src={trip.coverImage || "/placeholder.svg"}
                    alt={trip.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-xl font-semibold">{trip.title}</h3>
                  <p className="text-muted-foreground">{trip.subtitle}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-medium">{trip.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Start Date:</span>
                    <span className="font-medium">{new Date(trip.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>End Date:</span>
                    <span className="font-medium">{new Date(trip.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">
                      {Math.ceil(
                        (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24),
                      )}{" "}
                      days
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-ticket-alt mr-2 text-gold"></i>
                  Booking Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Booking ID:</span>
                    <span className="font-mono text-sm">{booking.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span className="font-medium">{booking.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span>{booking.customerEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <span>{booking.customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Travelers:</span>
                    <span className="font-medium">{booking.numberOfTravelers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Booking Date:</span>
                    <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant={getStatusColor(booking.paymentStatus)}>
                      {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                    </Badge>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="text-gold">₹{booking.totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {booking.specialRequests && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Special Requests:</h4>
                    <p className="text-sm text-muted-foreground">{booking.specialRequests}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Traveler Details */}
          {booking.travelers.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-users mr-2 text-gold"></i>
                  Traveler Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {booking.travelers.map((traveler, index) => (
                    <div key={index} className="border border-border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Traveler {index + 1}</h4>
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="font-medium">Name:</span> {traveler.name}
                        </div>
                        <div>
                          <span className="font-medium">Age:</span> {traveler.age}
                        </div>
                        <div>
                          <span className="font-medium">Gender:</span> {traveler.gender}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-info-circle mr-2 text-gold"></i>
                What's Next?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <i className="fas fa-envelope text-gold mt-1"></i>
                  <div>
                    <h4 className="font-semibold">Confirmation Email</h4>
                    <p className="text-sm text-muted-foreground">
                      You'll receive a detailed confirmation email with your itinerary and important travel information.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <i className="fas fa-phone text-gold mt-1"></i>
                  <div>
                    <h4 className="font-semibold">Pre-Trip Contact</h4>
                    <p className="text-sm text-muted-foreground">
                      Our team will contact you 2-3 days before departure with final details and pickup information.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <i className="fas fa-suitcase text-gold mt-1"></i>
                  <div>
                    <h4 className="font-semibold">Packing Guide</h4>
                    <p className="text-sm text-muted-foreground">
                      A detailed packing list and travel tips will be shared via email based on your destination.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link href="/travel-with-us">
              <Button variant="outline" size="lg">
                <i className="fas fa-search mr-2"></i>
                Browse More Trips
              </Button>
            </Link>

            <Button onClick={() => window.print()} variant="outline" size="lg">
              <i className="fas fa-print mr-2"></i>
              Print Confirmation
            </Button>

            <Link href="/">
              <Button className="btn-primary" size="lg">
                <i className="fas fa-home mr-2"></i>
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
