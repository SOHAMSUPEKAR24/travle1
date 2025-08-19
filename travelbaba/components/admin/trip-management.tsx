"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { dataStore, type Trip, type Booking } from "@/lib/data-store"

export function TripManagement() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const { toast } = useToast()

  const [analytics, setAnalytics] = useState({
    totalTrips: 0,
    activeTrips: 0,
    completedTrips: 0,
    totalRevenue: 0,
    avgOccupancy: 0,
    topPerformingTrips: [] as Array<Trip & { bookingCount: number; revenue: number }>,
  })

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    location: "",
    startDate: "",
    endDate: "",
    price: "",
    capacity: "",
    availableSeats: "",
    coverImage: "",
    categories: "",
    highlights: "",
    description: "",
    mapUrl: "",
    featured: false,
    itinerary: [] as Array<{ day: number; title: string; details: string }>,
  })

  useEffect(() => {
    loadData()
    calculateAnalytics()
  }, [])

  const loadData = () => {
    setTrips(dataStore.getTrips())
    setBookings(dataStore.getBookings())
  }

  const calculateAnalytics = () => {
    const allTrips = dataStore.getTrips()
    const allBookings = dataStore.getBookings()

    const now = new Date()
    const activeTrips = allTrips.filter((trip) => new Date(trip.startDate) > now).length
    const completedTrips = allTrips.filter((trip) => new Date(trip.endDate) < now).length

    const totalRevenue = allBookings
      .filter((booking) => booking.paymentStatus === "completed")
      .reduce((sum, booking) => sum + booking.totalAmount, 0)

    // Calculate occupancy rate
    const totalCapacity = allTrips.reduce((sum, trip) => sum + trip.capacity, 0)
    const totalBooked = allTrips.reduce((sum, trip) => sum + (trip.capacity - trip.availableSeats), 0)
    const avgOccupancy = totalCapacity > 0 ? (totalBooked / totalCapacity) * 100 : 0

    // Top performing trips
    const tripPerformance = allTrips
      .map((trip) => {
        const tripBookings = allBookings.filter((booking) => booking.tripId === trip.id)
        const bookingCount = tripBookings.length
        const revenue = tripBookings
          .filter((booking) => booking.paymentStatus === "completed")
          .reduce((sum, booking) => sum + booking.totalAmount, 0)

        return { ...trip, bookingCount, revenue }
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    setAnalytics({
      totalTrips: allTrips.length,
      activeTrips,
      completedTrips,
      totalRevenue,
      avgOccupancy,
      topPerformingTrips: tripPerformance,
    })
  }

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      location: "",
      startDate: "",
      endDate: "",
      price: "",
      capacity: "",
      availableSeats: "",
      coverImage: "",
      categories: "",
      highlights: "",
      description: "",
      mapUrl: "",
      featured: false,
      itinerary: [],
    })
    setEditingTrip(null)
  }

  const handleEdit = (trip: Trip) => {
    setEditingTrip(trip)
    setFormData({
      title: trip.title,
      subtitle: trip.subtitle,
      location: trip.location,
      startDate: trip.startDate,
      endDate: trip.endDate,
      price: trip.price.toString(),
      capacity: trip.capacity.toString(),
      availableSeats: trip.availableSeats.toString(),
      coverImage: trip.coverImage,
      categories: trip.categories.join(", "),
      highlights: trip.highlights.join(", "),
      description: trip.description || "",
      mapUrl: trip.mapUrl,
      featured: trip.featured,
      itinerary: trip.itinerary || [],
    })
    setIsDialogOpen(true)
  }

  const addItineraryDay = () => {
    setFormData({
      ...formData,
      itinerary: [...formData.itinerary, { day: formData.itinerary.length + 1, title: "", details: "" }],
    })
  }

  const updateItineraryDay = (index: number, field: string, value: string) => {
    const updatedItinerary = [...formData.itinerary]
    updatedItinerary[index] = { ...updatedItinerary[index], [field]: value }
    setFormData({ ...formData, itinerary: updatedItinerary })
  }

  const removeItineraryDay = (index: number) => {
    const updatedItinerary = formData.itinerary.filter((_, i) => i !== index)
    setFormData({ ...formData, itinerary: updatedItinerary })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const tripData = {
      title: formData.title,
      subtitle: formData.subtitle,
      location: formData.location,
      startDate: formData.startDate,
      endDate: formData.endDate,
      price: Number.parseInt(formData.price),
      currency: "INR",
      capacity: Number.parseInt(formData.capacity),
      availableSeats: Number.parseInt(formData.availableSeats),
      coverImage: formData.coverImage || "/diverse-travel-destinations.png",
      gallery: [],
      categories: formData.categories.split(",").map((cat) => cat.trim()),
      highlights: formData.highlights.split(",").map((highlight) => highlight.trim()),
      itinerary: formData.itinerary,
      mapUrl: formData.mapUrl,
      featured: formData.featured,
      description: formData.description,
    }

    try {
      if (editingTrip) {
        dataStore.updateTrip(editingTrip.id, tripData)
        toast({
          title: "Trip Updated",
          description: "Trip has been updated successfully.",
        })
      } else {
        dataStore.addTrip(tripData)
        toast({
          title: "Trip Created",
          description: "New trip has been created successfully.",
        })
      }

      loadData()
      calculateAnalytics()
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save trip. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this trip?")) {
      dataStore.deleteTrip(id)
      loadData()
      calculateAnalytics()
      toast({
        title: "Trip Deleted",
        description: "Trip has been deleted successfully.",
      })
    }
  }

  const getTripStatus = (trip: Trip): string => {
    const now = new Date()
    const startDate = new Date(trip.startDate)
    const endDate = new Date(trip.endDate)

    if (endDate < now) return "completed"
    if (startDate > now) return "upcoming"
    return "ongoing"
  }

  const getTripBookings = (tripId: string): Booking[] => {
    return bookings.filter((booking) => booking.tripId === tripId)
  }

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.categories.some((cat) => cat.toLowerCase().includes(searchTerm.toLowerCase()))

    if (!matchesSearch) return false

    if (filterStatus === "all") return true
    return getTripStatus(trip) === filterStatus
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Advanced Trip Management</CardTitle>
            <CardDescription>Comprehensive trip lifecycle and performance management</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="btn-primary">
                <i className="fas fa-plus mr-2"></i>
                Add Trip
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingTrip ? "Edit Trip" : "Add New Trip"}</DialogTitle>
                <DialogDescription>
                  {editingTrip ? "Update trip details" : "Create a comprehensive travel package"}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Trip Title</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="subtitle">Subtitle</Label>
                        <Input
                          id="subtitle"
                          value={formData.subtitle}
                          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="price">Price (INR)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="capacity">Total Capacity</Label>
                        <Input
                          id="capacity"
                          type="number"
                          value={formData.capacity}
                          onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="availableSeats">Available Seats</Label>
                        <Input
                          id="availableSeats"
                          type="number"
                          value={formData.availableSeats}
                          onChange={(e) => setFormData({ ...formData, availableSeats: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        placeholder="Detailed trip description..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="categories">Categories (comma-separated)</Label>
                        <Input
                          id="categories"
                          value={formData.categories}
                          onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                          placeholder="Beach, Culture, Adventure"
                        />
                      </div>
                      <div>
                        <Label htmlFor="highlights">Highlights (comma-separated)</Label>
                        <Input
                          id="highlights"
                          value={formData.highlights}
                          onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                          placeholder="Sunset views, Local cuisine, Historical sites"
                        />
                      </div>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="itinerary" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Day-by-Day Itinerary</h3>
                    <Button type="button" onClick={addItineraryDay} variant="outline">
                      <i className="fas fa-plus mr-2"></i>
                      Add Day
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {formData.itinerary.map((day, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold">Day {day.day}</h4>
                            <Button type="button" variant="outline" size="sm" onClick={() => removeItineraryDay(index)}>
                              <i className="fas fa-trash"></i>
                            </Button>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <Label>Day Title</Label>
                              <Input
                                value={day.title}
                                onChange={(e) => updateItineraryDay(index, "title", e.target.value)}
                                placeholder="e.g., Arrival in Goa"
                              />
                            </div>
                            <div>
                              <Label>Details</Label>
                              <Textarea
                                value={day.details}
                                onChange={(e) => updateItineraryDay(index, "details", e.target.value)}
                                rows={2}
                                placeholder="Detailed activities for this day..."
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <div>
                    <Label htmlFor="coverImage">Cover Image URL</Label>
                    <Input
                      id="coverImage"
                      value={formData.coverImage}
                      onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                      placeholder="Leave empty for auto-generated placeholder"
                    />
                  </div>

                  <div>
                    <Label htmlFor="mapUrl">Map URL</Label>
                    <Input
                      id="mapUrl"
                      value={formData.mapUrl}
                      onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
                      placeholder="https://maps.google.com/?q=Location"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                    />
                    <Label htmlFor="featured">Featured Trip</Label>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className="btn-primary">
                  {editingTrip ? "Update Trip" : "Create Trip"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trips">All Trips</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-primary">{analytics.totalTrips}</div>
                  <div className="text-sm text-muted-foreground">Total Trips</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">{analytics.activeTrips}</div>
                  <div className="text-sm text-muted-foreground">Active Trips</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{analytics.completedTrips}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-gold">₹{analytics.totalRevenue.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">{Math.round(analytics.avgOccupancy)}%</div>
                  <div className="text-sm text-muted-foreground">Avg. Occupancy</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trips" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Search trips by title, location, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trip</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Occupancy</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrips.map((trip) => {
                    const tripBookings = getTripBookings(trip.id)
                    const revenue = tripBookings
                      .filter((booking) => booking.paymentStatus === "completed")
                      .reduce((sum, booking) => sum + booking.totalAmount, 0)
                    const occupancyRate = ((trip.capacity - trip.availableSeats) / trip.capacity) * 100
                    const status = getTripStatus(trip)

                    return (
                      <TableRow key={trip.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{trip.title}</div>
                            <div className="text-sm text-muted-foreground">{trip.subtitle}</div>
                            <div className="flex gap-1 mt-1">
                              {trip.categories.slice(0, 2).map((category) => (
                                <Badge key={category} variant="secondary" className="text-xs">
                                  {category}
                                </Badge>
                              ))}
                              {trip.featured && <Badge className="text-xs bg-gold text-white">Featured</Badge>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{trip.location}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(trip.startDate).toLocaleDateString()} -<br />
                            {new Date(trip.endDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>₹{trip.price.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="font-semibold">{Math.round(occupancyRate)}%</div>
                            <div className="text-xs text-muted-foreground">
                              {trip.capacity - trip.availableSeats}/{trip.capacity}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>₹{revenue.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant={status === "upcoming" ? "default" : status === "ongoing" ? "secondary" : "outline"}
                          >
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(trip)}>
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(trip.id)}>
                              <i className="fas fa-trash text-destructive"></i>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Trips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topPerformingTrips.map((trip, index) => (
                    <div key={trip.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{trip.title}</div>
                          <div className="text-sm text-muted-foreground">{trip.location}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">₹{trip.revenue.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{trip.bookingCount} bookings</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {filteredTrips.length === 0 && (
          <div className="text-center py-8">
            <i className="fas fa-route text-4xl text-muted-foreground mb-4"></i>
            <p className="text-muted-foreground">No trips found. Create your first trip to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
