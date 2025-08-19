"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { PaymentModal } from "./payment-modal"
import type { Trip, Booking } from "@/lib/data-store"
import type { PaymentResult } from "@/lib/payment-service"

interface BookingModalProps {
  trip: Trip
  isOpen: boolean
  onClose: () => void
}

export function BookingModal({ trip, isOpen, onClose }: BookingModalProps) {
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [bookingData, setBookingData] = useState<Omit<Booking, "id"> | null>(null)

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    numberOfTravelers: "1",
    specialRequests: "",
    travelers: [{ name: "", age: "", gender: "" }],
  })

  const resetForm = () => {
    setFormData({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      numberOfTravelers: "1",
      specialRequests: "",
      travelers: [{ name: "", age: "", gender: "" }],
    })
    setStep(1)
    setBookingData(null)
  }

  const handleClose = () => {
    onClose()
    resetForm()
  }

  const handleNext = () => {
    if (step === 1) {
      if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        })
        return
      }
    }
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleTravelerChange = (index: number, field: string, value: string) => {
    const updatedTravelers = [...formData.travelers]
    updatedTravelers[index] = { ...updatedTravelers[index], [field]: value }
    setFormData({ ...formData, travelers: updatedTravelers })
  }

  const handleNumberOfTravelersChange = (value: string) => {
    const count = Number.parseInt(value)
    const travelers = Array.from(
      { length: count },
      (_, i) => formData.travelers[i] || { name: "", age: "", gender: "" },
    )
    setFormData({ ...formData, numberOfTravelers: value, travelers })
  }

  const handleProceedToPayment = () => {
    const totalAmount = trip.price * Number.parseInt(formData.numberOfTravelers)

    const booking: Omit<Booking, "id"> = {
      tripId: trip.id,
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      numberOfTravelers: Number.parseInt(formData.numberOfTravelers),
      totalAmount,
      paymentStatus: "pending",
      bookingDate: new Date().toISOString(),
      specialRequests: formData.specialRequests,
      travelers: formData.travelers.map((t) => ({
        name: t.name,
        age: Number.parseInt(t.age) || 0,
        gender: t.gender,
      })),
    }

    setBookingData(booking)
    setIsPaymentModalOpen(true)
  }

  const handlePaymentSuccess = (paymentResult: PaymentResult) => {
    setIsPaymentModalOpen(false)
    handleClose()

    toast({
      title: "Booking Confirmed!",
      description: "Your trip has been booked successfully. Check your email for confirmation details.",
    })
  }

  const totalAmount = trip.price * Number.parseInt(formData.numberOfTravelers)

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book Your Trip</DialogTitle>
            <DialogDescription>
              {trip.title} - Step {step} of 3
            </DialogDescription>
          </DialogHeader>

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>

              <div>
                <Label htmlFor="customerName">Full Name *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="customerEmail">Email Address *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="customerPhone">Phone Number *</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="numberOfTravelers">Number of Travelers</Label>
                <Select value={formData.numberOfTravelers} onValueChange={handleNumberOfTravelersChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: Math.min(trip.availableSeats, 8) }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1} {i === 0 ? "Person" : "People"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleNext} className="btn-primary">
                  Next: Traveler Details
                  <i className="fas fa-arrow-right ml-2"></i>
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Traveler Details</h3>

              {formData.travelers.map((traveler, index) => (
                <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium">Traveler {index + 1}</h4>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor={`traveler-name-${index}`}>Full Name</Label>
                      <Input
                        id={`traveler-name-${index}`}
                        value={traveler.name}
                        onChange={(e) => handleTravelerChange(index, "name", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`traveler-age-${index}`}>Age</Label>
                      <Input
                        id={`traveler-age-${index}`}
                        type="number"
                        value={traveler.age}
                        onChange={(e) => handleTravelerChange(index, "age", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`traveler-gender-${index}`}>Gender</Label>
                      <Select
                        value={traveler.gender}
                        onValueChange={(value) => handleTravelerChange(index, "gender", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}

              <div>
                <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                <Textarea
                  id="specialRequests"
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  rows={3}
                  placeholder="Any dietary restrictions, accessibility needs, or special occasions..."
                />
              </div>

              <div className="flex justify-between">
                <Button onClick={handleBack} variant="outline">
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back
                </Button>
                <Button onClick={handleNext} className="btn-primary">
                  Next: Review & Pay
                  <i className="fas fa-arrow-right ml-2"></i>
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Review Your Booking</h3>

              <div className="bg-soft-gray rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span>Trip:</span>
                  <span className="font-semibold">{trip.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dates:</span>
                  <span>
                    {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Travelers:</span>
                  <span>
                    {formData.numberOfTravelers} person{Number.parseInt(formData.numberOfTravelers) > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Price per person:</span>
                  <span>₹{trip.price.toLocaleString()}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-gold">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-beige/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Contact Information</h4>
                <p className="text-sm">{formData.customerName}</p>
                <p className="text-sm">{formData.customerEmail}</p>
                <p className="text-sm">{formData.customerPhone}</p>
              </div>

              <div className="flex justify-between">
                <Button onClick={handleBack} variant="outline">
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back
                </Button>
                <Button onClick={handleProceedToPayment} className="btn-primary">
                  <i className="fas fa-credit-card mr-2"></i>
                  Proceed to Payment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {bookingData && (
        <PaymentModal
          booking={bookingData}
          trip={trip}
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  )
}
