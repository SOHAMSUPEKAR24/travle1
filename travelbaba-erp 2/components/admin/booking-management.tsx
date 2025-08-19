"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { dataStore, type Booking } from "@/lib/data-store"

export function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = () => {
    setBookings(dataStore.getBookings())
  }

  const updateBookingStatus = (bookingId: string, status: Booking["paymentStatus"]) => {
    // In a real implementation, this would update the booking status
    toast({
      title: "Status Updated",
      description: `Booking status updated to ${status}`,
    })
  }

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Booking Management</CardTitle>
            <CardDescription>Manage customer bookings and payments</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={loadBookings}>
              <i className="fas fa-refresh mr-2"></i>
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Search bookings by customer name, email, or booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Trip</TableHead>
                <TableHead>Travelers</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => {
                const trip = dataStore.getTripById(booking.tripId)
                return (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="font-mono text-sm">{booking.id}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{booking.customerName}</div>
                        <div className="text-sm text-muted-foreground">{booking.customerEmail}</div>
                        <div className="text-sm text-muted-foreground">{booking.customerPhone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="font-medium">{trip?.title || "Unknown Trip"}</div>
                        <div className="text-sm text-muted-foreground">{trip?.location}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{booking.numberOfTravelers}</div>
                        <div className="text-xs text-muted-foreground">travelers</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">₹{booking.totalAmount.toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(booking.paymentStatus)}>
                        {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(booking.bookingDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        {booking.paymentStatus === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateBookingStatus(booking.id, "completed")}
                            >
                              <i className="fas fa-check text-green-600"></i>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateBookingStatus(booking.id, "failed")}
                            >
                              <i className="fas fa-times text-red-600"></i>
                            </Button>
                          </>
                        )}
                        {booking.paymentStatus === "completed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateBookingStatus(booking.id, "refunded")}
                          >
                            <i className="fas fa-undo text-orange-600"></i>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-8">
            <i className="fas fa-calendar-check text-4xl text-muted-foreground mb-4"></i>
            <p className="text-muted-foreground">
              {bookings.length === 0 ? "No bookings yet." : "No bookings match your search."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
