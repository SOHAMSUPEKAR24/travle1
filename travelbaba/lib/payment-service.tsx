// Payment service with Razorpay and Stripe integration stubs
export interface PaymentGateway {
  name: string
  initialize(): Promise<void>
  createPaymentIntent(amount: number, currency: string, metadata: any): Promise<PaymentIntent>
  processPayment(paymentIntent: PaymentIntent, paymentMethod: any): Promise<PaymentResult>
}

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: "created" | "processing" | "succeeded" | "failed"
  clientSecret?: string
  metadata: any
}

export interface PaymentResult {
  success: boolean
  paymentId: string
  status: "succeeded" | "failed" | "pending"
  error?: string
  receipt?: PaymentReceipt
}

export interface PaymentReceipt {
  id: string
  paymentId: string
  amount: number
  currency: string
  date: string
  customerName: string
  customerEmail: string
  tripTitle: string
  travelers: number
  paymentMethod: string
}

// Razorpay Integration Stub
class RazorpayGateway implements PaymentGateway {
  name = "Razorpay"
  private isInitialized = false

  async initialize(): Promise<void> {
    // In production, load Razorpay SDK
    console.log("[Payment] Initializing Razorpay...")

    // Simulate SDK loading
    await new Promise((resolve) => setTimeout(resolve, 1000))
    this.isInitialized = true
    console.log("[Payment] Razorpay initialized successfully")
  }

  async createPaymentIntent(amount: number, currency: string, metadata: any): Promise<PaymentIntent> {
    if (!this.isInitialized) {
      throw new Error("Razorpay not initialized")
    }

    // Simulate Razorpay order creation
    const paymentIntent: PaymentIntent = {
      id: `rzp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: amount * 100, // Razorpay uses paise
      currency: currency.toUpperCase(),
      status: "created",
      metadata,
    }

    console.log("[Payment] Created Razorpay payment intent:", paymentIntent.id)
    return paymentIntent
  }

  async processPayment(paymentIntent: PaymentIntent, paymentMethod: any): Promise<PaymentResult> {
    console.log("[Payment] Processing Razorpay payment:", paymentIntent.id)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate 90% success rate
    const success = Math.random() > 0.1

    if (success) {
      const receipt: PaymentReceipt = {
        id: `rcpt_${Date.now()}`,
        paymentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        date: new Date().toISOString(),
        customerName: paymentIntent.metadata.customerName,
        customerEmail: paymentIntent.metadata.customerEmail,
        tripTitle: paymentIntent.metadata.tripTitle,
        travelers: paymentIntent.metadata.travelers,
        paymentMethod: "Razorpay",
      }

      return {
        success: true,
        paymentId: paymentIntent.id,
        status: "succeeded",
        receipt,
      }
    } else {
      return {
        success: false,
        paymentId: paymentIntent.id,
        status: "failed",
        error: "Payment declined by bank",
      }
    }
  }
}

// Stripe Integration Stub
class StripeGateway implements PaymentGateway {
  name = "Stripe"
  private isInitialized = false

  async initialize(): Promise<void> {
    console.log("[Payment] Initializing Stripe...")

    // Simulate SDK loading
    await new Promise((resolve) => setTimeout(resolve, 1000))
    this.isInitialized = true
    console.log("[Payment] Stripe initialized successfully")
  }

  async createPaymentIntent(amount: number, currency: string, metadata: any): Promise<PaymentIntent> {
    if (!this.isInitialized) {
      throw new Error("Stripe not initialized")
    }

    const paymentIntent: PaymentIntent = {
      id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: amount * 100, // Stripe uses cents
      currency: currency.toLowerCase(),
      status: "created",
      clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      metadata,
    }

    console.log("[Payment] Created Stripe payment intent:", paymentIntent.id)
    return paymentIntent
  }

  async processPayment(paymentIntent: PaymentIntent, paymentMethod: any): Promise<PaymentResult> {
    console.log("[Payment] Processing Stripe payment:", paymentIntent.id)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate 95% success rate
    const success = Math.random() > 0.05

    if (success) {
      const receipt: PaymentReceipt = {
        id: `rcpt_${Date.now()}`,
        paymentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        date: new Date().toISOString(),
        customerName: paymentIntent.metadata.customerName,
        customerEmail: paymentIntent.metadata.customerEmail,
        tripTitle: paymentIntent.metadata.tripTitle,
        travelers: paymentIntent.metadata.travelers,
        paymentMethod: "Stripe",
      }

      return {
        success: true,
        paymentId: paymentIntent.id,
        status: "succeeded",
        receipt,
      }
    } else {
      return {
        success: false,
        paymentId: paymentIntent.id,
        status: "failed",
        error: "Your card was declined",
      }
    }
  }
}

// Payment Service Manager
class PaymentService {
  private gateways: Map<string, PaymentGateway> = new Map()
  private defaultGateway = "razorpay"

  constructor() {
    this.gateways.set("razorpay", new RazorpayGateway())
    this.gateways.set("stripe", new StripeGateway())
  }

  async initializeGateway(gatewayName: string): Promise<void> {
    const gateway = this.gateways.get(gatewayName)
    if (!gateway) {
      throw new Error(`Payment gateway ${gatewayName} not found`)
    }
    await gateway.initialize()
  }

  async createPayment(
    amount: number,
    currency = "INR",
    metadata: any,
    gatewayName: string = this.defaultGateway,
  ): Promise<PaymentIntent> {
    const gateway = this.gateways.get(gatewayName)
    if (!gateway) {
      throw new Error(`Payment gateway ${gatewayName} not found`)
    }

    return await gateway.createPaymentIntent(amount, currency, metadata)
  }

  async processPayment(
    paymentIntent: PaymentIntent,
    paymentMethod: any,
    gatewayName: string = this.defaultGateway,
  ): Promise<PaymentResult> {
    const gateway = this.gateways.get(gatewayName)
    if (!gateway) {
      throw new Error(`Payment gateway ${gatewayName} not found`)
    }

    return await gateway.processPayment(paymentIntent, paymentMethod)
  }

  getAvailableGateways(): string[] {
    return Array.from(this.gateways.keys())
  }
}

export const paymentService = new PaymentService()

// Receipt Generator
export class ReceiptGenerator {
  static generateHTML(receipt: PaymentReceipt): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Payment Receipt - ${receipt.id}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #d4af37; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { color: #d4af37; font-size: 24px; font-weight: bold; }
        .receipt-info { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .total { font-size: 18px; font-weight: bold; color: #d4af37; border-top: 1px solid #ddd; padding-top: 10px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">TravelBabaVoyage</div>
        <h2>Payment Receipt</h2>
        <p>Receipt ID: ${receipt.id}</p>
    </div>
    
    <div class="receipt-info">
        <div class="row">
            <span>Customer Name:</span>
            <span>${receipt.customerName}</span>
        </div>
        <div class="row">
            <span>Email:</span>
            <span>${receipt.customerEmail}</span>
        </div>
        <div class="row">
            <span>Trip:</span>
            <span>${receipt.tripTitle}</span>
        </div>
        <div class="row">
            <span>Number of Travelers:</span>
            <span>${receipt.travelers}</span>
        </div>
        <div class="row">
            <span>Payment Method:</span>
            <span>${receipt.paymentMethod}</span>
        </div>
        <div class="row">
            <span>Payment ID:</span>
            <span>${receipt.paymentId}</span>
        </div>
        <div class="row">
            <span>Date:</span>
            <span>${new Date(receipt.date).toLocaleString()}</span>
        </div>
        <div class="row total">
            <span>Total Amount:</span>
            <span>₹${receipt.amount.toLocaleString()}</span>
        </div>
    </div>
    
    <div class="footer">
        <p>Thank you for choosing TravelBabaVoyage!</p>
        <p>For any queries, contact us at info@travelbabavoyage.com</p>
    </div>
</body>
</html>
    `
  }

  static downloadReceipt(receipt: PaymentReceipt): void {
    const html = this.generateHTML(receipt)
    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `receipt-${receipt.id}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}
