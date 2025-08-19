"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { dataStore, type Trip } from "@/lib/data-store"

export default function TravelWithUsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [priceRange, setPriceRange] = useState("all")

  useEffect(() => {
    const allTrips = dataStore.getTrips()
    setTrips(allTrips)
    setFilteredTrips(allTrips)
  }, [])

  useEffect(() => {
    let filtered = trips

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (trip) =>
          trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trip.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trip.categories.some((cat) => cat.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((trip) =>
        trip.categories.some((cat) => cat.toLowerCase() === selectedCategory.toLowerCase()),
      )
    }

    // Filter by price range
    if (priceRange !== "all") {
      switch (priceRange) {
        case "budget":
          filtered = filtered.filter((trip) => trip.price < 25000)
          break
        case "mid":
          filtered = filtered.filter((trip) => trip.price >= 25000 && trip.price < 50000)
          break
        case "luxury":
          filtered = filtered.filter((trip) => trip.price >= 50000)
          break
      }
    }

    setFilteredTrips(filtered)
  }, [trips, searchTerm, selectedCategory, priceRange])

  const allCategories = Array.from(new Set(trips.flatMap((trip) => trip.categories)))

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-warm">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-deep-brown mb-6">Travel With Us</h1>
          <p className="text-xl text-brown max-w-3xl mx-auto leading-relaxed">
            Discover our carefully curated travel experiences across India's most breathtaking destinations. From
            cultural immersions to adventure expeditions, find your perfect journey.
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <Input
                placeholder="Search trips by destination, title, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {allCategories.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="budget">Under ₹25,000</SelectItem>
                  <SelectItem value="mid">₹25,000 - ₹50,000</SelectItem>
                  <SelectItem value="luxury">Above ₹50,000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground">
              {filteredTrips.length} trip{filteredTrips.length !== 1 ? "s" : ""} found
            </div>
          </div>
        </div>
      </section>

      {/* Trips Grid */}
      <section className="py-16 bg-soft-gray">
        <div className="max-w-7xl mx-auto px-6">
          {filteredTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTrips.map((trip) => (
                <Card key={trip.id} className="travel-card overflow-hidden">
                  <div className="relative h-48">
                    <img
                      src={trip.coverImage || "/placeholder.svg"}
                      alt={trip.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      {trip.featured && (
                        <Badge className="bg-gold text-white">
                          <i className="fas fa-star mr-1"></i>
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-background/90 text-foreground">
                        {trip.availableSeats} seats left
                      </Badge>
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-xl">{trip.title}</CardTitle>
                    <CardDescription>{trip.subtitle}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <i className="fas fa-map-marker-alt mr-2 text-gold"></i>
                        {trip.location}
                      </div>

                      <div className="flex items-center text-sm text-muted-foreground">
                        <i className="fas fa-calendar mr-2 text-gold"></i>
                        {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {trip.categories.slice(0, 3).map((category) => (
                          <Badge key={category} variant="secondary" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-gold">₹{trip.price.toLocaleString()}</span>
                          <span className="text-sm text-muted-foreground ml-1">per person</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {Math.ceil(
                            (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
                              (1000 * 60 * 60 * 24),
                          )}{" "}
                          days
                        </div>
                      </div>

                      <Link href={`/trip/${trip.id}`}>
                        <Button className="w-full btn-primary">
                          View Details & Book
                          <i className="fas fa-arrow-right ml-2"></i>
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <i className="fas fa-search text-6xl text-muted-foreground mb-6"></i>
              <h3 className="text-2xl font-semibold text-foreground mb-4">No trips found</h3>
              <p className="text-muted-foreground mb-8">
                Try adjusting your search criteria or browse all available trips.
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("all")
                  setPriceRange("all")
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
