"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { paymentService, ReceiptGenerator, type PaymentIntent, type PaymentResult } from "@/lib/payment-service"
import { dataStore, type Trip, type Booking } from "@/lib/data-store"

interface PaymentModalProps {
  booking: Omit<Booking, "id">
  trip: Trip
  isOpen: boolean
  onClose: () => void
  onSuccess: (paymentResult: PaymentResult) => void
}

export function PaymentModal({ booking, trip, isOpen, onClose, onSuccess }: PaymentModalProps) {
  const { toast } = useToast()
  const [step, setStep] = useState<"gateway" | "processing" | "success" | "failed">("gateway")
  const [selectedGateway, setSelectedGateway] = useState("razorpay")
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null)
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const availableGateways = [
    { id: "razorpay", name: "Razorpay", description: "UPI, Cards, Net Banking", icon: "fas fa-credit-card" },
    { id: "stripe", name: "Stripe", description: "International Cards", icon: "fab fa-stripe" },
  ]

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setStep("gateway")
      setPaymentIntent(null)
      setPaymentResult(null)
      setIsProcessing(false)
    }
  }, [isOpen])

  const handleGatewaySelect = async (gatewayId: string) => {
    setSelectedGateway(gatewayId)
    setIsProcessing(true)

    try {
      // Initialize payment gateway
      await paymentService.initializeGateway(gatewayId)

      // Create payment intent
      const intent = await paymentService.createPayment(
        booking.totalAmount,
        "INR",
        {
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          tripTitle: trip.title,
          travelers: booking.numberOfTravelers,
          bookingId: `temp_${Date.now()}`,
        },
        gatewayId,
      )

      setPaymentIntent(intent)
      toast({
        title: "Payment Initialized",
        description: `${gatewayId === "razorpay" ? "Razorpay" : "Stripe"} payment gateway ready.`,
      })
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment gateway. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePayment = async () => {
    if (!paymentIntent) return

    setStep("processing")
    setIsProcessing(true)

    try {
      // Simulate payment method (in real implementation, this would come from payment form)
      const paymentMethod = {
        type: selectedGateway === "razorpay" ? "upi" : "card",
        details: selectedGateway === "razorpay" ? { vpa: "user@paytm" } : { last4: "4242" },
      }

      const result = await paymentService.processPayment(paymentIntent, paymentMethod, selectedGateway)
      setPaymentResult(result)

      if (result.success) {
        // Create the actual booking with payment info
        const finalBooking = {
          ...booking,
          paymentStatus: "completed" as const,
          paymentId: result.paymentId,
          paymentMethod: selectedGateway,
        }

        const savedBooking = dataStore.addBooking(finalBooking)

        // Update trip availability
        dataStore.updateTrip(trip.id, {
          availableSeats: trip.availableSeats - booking.numberOfTravelers,
        })

        // Add/update customer
        const existingCustomers = dataStore.getCustomers()
        const existingCustomer = existingCustomers.find((c) => c.email === booking.customerEmail)

        if (existingCustomer) {
          // Update existing customer
          existingCustomer.bookings.push(savedBooking.id)
          existingCustomer.totalSpent += booking.totalAmount
        } else {
          // Create new customer
          dataStore.addCustomer({
            name: booking.customerName,
            email: booking.customerEmail,
            phone: booking.customerPhone,
            bookings: [savedBooking.id],
            totalSpent: booking.totalAmount,
            preferences: trip.categories,
          })
        }

        setStep("success")
        onSuccess(result)

        toast({
          title: "Payment Successful!",
          description: "Your booking has been confirmed. Receipt will be downloaded automatically.",
        })

        // Auto-download receipt
        if (result.receipt) {
          setTimeout(() => {
            ReceiptGenerator.downloadReceipt(result.receipt!)
          }, 2000)
        }
      } else {
        setStep("failed")
        toast({
          title: "Payment Failed",
          description: result.error || "Payment could not be processed. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      setStep("failed")
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (step === "processing") return // Prevent closing during payment
    onClose()
  }

  const handleRetry = () => {
    setStep("gateway")
    setPaymentIntent(null)
    setPaymentResult(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            {step === "gateway" && "Choose your preferred payment method"}
            {step === "processing" && "Processing your payment..."}
            {step === "success" && "Payment completed successfully!"}
            {step === "failed" && "Payment failed"}
          </DialogDescription>
        </DialogHeader>

        {step === "gateway" && (
          <div className="space-y-6">
            {/* Booking Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Trip:</span>
                  <span className="font-semibold">{trip.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{booking.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Travelers:</span>
                  <span>
                    {booking.numberOfTravelers} person{booking.numberOfTravelers > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Price per person:</span>
                  <span>₹{trip.price.toLocaleString()}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-gold">₹{booking.totalAmount.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Gateway Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {availableGateways.map((gateway) => (
                  <div
                    key={gateway.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedGateway === gateway.id ? "border-gold bg-gold/5" : "border-border hover:border-gold/50"
                    }`}
                    onClick={() => setSelectedGateway(gateway.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <i className={`${gateway.icon} text-2xl text-gold`}></i>
                        <div>
                          <div className="font-semibold">{gateway.name}</div>
                          <div className="text-sm text-muted-foreground">{gateway.description}</div>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          selectedGateway === gateway.id ? "border-gold bg-gold" : "border-muted-foreground"
                        }`}
                      />
                    </div>
                  </div>
                ))}

                <Button
                  onClick={() => handleGatewaySelect(selectedGateway)}
                  disabled={isProcessing || !!paymentIntent}
                  className="w-full btn-primary mt-6"
                >
                  {isProcessing ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Initializing...
                    </>
                  ) : paymentIntent ? (
                    <>
                      <i className="fas fa-check mr-2"></i>
                      Ready to Pay
                    </>
                  ) : (
                    <>
                      <i className="fas fa-arrow-right mr-2"></i>
                      Continue to Payment
                    </>
                  )}
                </Button>

                {paymentIntent && (
                  <Button onClick={handlePayment} className="w-full btn-primary" size="lg">
                    <i className="fas fa-credit-card mr-2"></i>
                    Pay ₹{booking.totalAmount.toLocaleString()}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {step === "processing" && (
          <div className="text-center py-12">
            <div className="animate-spin w-16 h-16 border-4 border-gold border-t-transparent rounded-full mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold mb-2">Processing Payment</h3>
            <p className="text-muted-foreground mb-4">Please don't close this window...</p>
            <Badge variant="secondary">
              <i className="fas fa-shield-alt mr-2"></i>
              Secure Payment Processing
            </Badge>
          </div>
        )}

        {step === "success" && paymentResult && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-check text-2xl text-green-600"></i>
            </div>
            <h3 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h3>
            <p className="text-muted-foreground mb-6">
              Your booking has been confirmed. You will receive a confirmation email shortly.
            </p>

            <Card className="text-left mb-6">
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Payment ID:</span>
                    <span className="font-mono">{paymentResult.paymentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-semibold">₹{booking.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-3">
              <Button
                onClick={() => paymentResult.receipt && ReceiptGenerator.downloadReceipt(paymentResult.receipt)}
                variant="outline"
                disabled={!paymentResult.receipt}
              >
                <i className="fas fa-download mr-2"></i>
                Download Receipt
              </Button>
              <Button onClick={handleClose} className="btn-primary">
                <i className="fas fa-check mr-2"></i>
                Done
              </Button>
            </div>
          </div>
        )}

        {step === "failed" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-times text-2xl text-red-600"></i>
            </div>
            <h3 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h3>
            <p className="text-muted-foreground mb-6">
              {paymentResult?.error || "Your payment could not be processed. Please try again."}
            </p>

            <div className="flex space-x-3 justify-center">
              <Button onClick={handleRetry} className="btn-primary">
                <i className="fas fa-redo mr-2"></i>
                Try Again
              </Button>
              <Button onClick={handleClose} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
