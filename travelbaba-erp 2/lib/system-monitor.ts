// System monitoring and health check utilities
export interface SystemHealth {
  status: "healthy" | "warning" | "critical"
  timestamp: string
  checks: {
    dataStore: boolean
    localStorage: boolean
    paymentService: boolean
    memoryUsage: number
    errorCount: number
  }
  metrics: {
    totalTrips: number
    totalBookings: number
    totalCustomers: number
    totalBlogs: number
    dataSize: number
  }
}

export interface SystemError {
  id: string
  timestamp: string
  level: "info" | "warning" | "error" | "critical"
  component: string
  message: string
  stack?: string
  context?: any
}

class SystemMonitor {
  private errors: SystemError[] = []
  private maxErrors = 100
  private healthCheckInterval: NodeJS.Timeout | null = null

  constructor() {
    this.startHealthChecks()
    this.setupErrorHandling()
  }

  private startHealthChecks() {
    if (typeof window === "undefined") return

    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck()
    }, 30000) // Check every 30 seconds
  }

  private setupErrorHandling() {
    if (typeof window === "undefined") return

    window.addEventListener("error", (event) => {
      this.logError({
        level: "error",
        component: "Global",
        message: event.message,
        stack: event.error?.stack,
        context: { filename: event.filename, lineno: event.lineno, colno: event.colno },
      })
    })

    window.addEventListener("unhandledrejection", (event) => {
      this.logError({
        level: "error",
        component: "Promise",
        message: `Unhandled promise rejection: ${event.reason}`,
        context: { reason: event.reason },
      })
    })
  }

  logError(error: Omit<SystemError, "id" | "timestamp">) {
    const systemError: SystemError = {
      id: `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...error,
    }

    this.errors.unshift(systemError)

    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors)
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error(`[SystemMonitor] ${error.level.toUpperCase()}: ${error.message}`, error.context)
    }

    // Store in localStorage for persistence
    try {
      localStorage.setItem("system_errors", JSON.stringify(this.errors.slice(0, 20)))
    } catch (e) {
      console.warn("Failed to store errors in localStorage")
    }
  }

  performHealthCheck(): SystemHealth {
    const timestamp = new Date().toISOString()
    let dataStoreHealthy = false
    let localStorageHealthy = false
    let paymentServiceHealthy = false
    let memoryUsage = 0
    let metrics = {
      totalTrips: 0,
      totalBookings: 0,
      totalCustomers: 0,
      totalBlogs: 0,
      dataSize: 0,
    }

    try {
      // Check data store
      const { dataStore } = require("./data-store")
      const trips = dataStore.getTrips()
      const bookings = dataStore.getBookings()
      const customers = dataStore.getCustomers()
      const blogs = dataStore.getBlogs()

      metrics = {
        totalTrips: trips.length,
        totalBookings: bookings.length,
        totalCustomers: customers.length,
        totalBlogs: blogs.length,
        dataSize: JSON.stringify({ trips, bookings, customers, blogs }).length,
      }

      dataStoreHealthy = true
    } catch (error) {
      this.logError({
        level: "error",
        component: "DataStore",
        message: "Data store health check failed",
        context: { error: error.message },
      })
    }

    try {
      // Check localStorage
      const testKey = "health_check_test"
      localStorage.setItem(testKey, "test")
      localStorage.removeItem(testKey)
      localStorageHealthy = true
    } catch (error) {
      this.logError({
        level: "warning",
        component: "LocalStorage",
        message: "LocalStorage not available",
        context: { error: error.message },
      })
    }

    try {
      // Check payment service
      const { paymentService } = require("./payment-service")
      paymentServiceHealthy = paymentService.getAvailableGateways().length > 0
    } catch (error) {
      this.logError({
        level: "warning",
        component: "PaymentService",
        message: "Payment service check failed",
        context: { error: error.message },
      })
    }

    // Estimate memory usage (rough approximation)
    if (typeof window !== "undefined" && (window as any).performance?.memory) {
      memoryUsage = (window as any).performance.memory.usedJSHeapSize / 1024 / 1024 // MB
    }

    const checks = {
      dataStore: dataStoreHealthy,
      localStorage: localStorageHealthy,
      paymentService: paymentServiceHealthy,
      memoryUsage,
      errorCount: this.errors.filter((e) => e.level === "error" || e.level === "critical").length,
    }

    // Determine overall status
    let status: SystemHealth["status"] = "healthy"
    if (!checks.dataStore || !checks.localStorage || checks.errorCount > 10) {
      status = "critical"
    } else if (!checks.paymentService || checks.memoryUsage > 100 || checks.errorCount > 5) {
      status = "warning"
    }

    const health: SystemHealth = {
      status,
      timestamp,
      checks,
      metrics,
    }

    // Store health status
    try {
      localStorage.setItem("system_health", JSON.stringify(health))
    } catch (e) {
      console.warn("Failed to store health status")
    }

    return health
  }

  getErrors(level?: SystemError["level"]): SystemError[] {
    if (level) {
      return this.errors.filter((error) => error.level === level)
    }
    return [...this.errors]
  }

  clearErrors() {
    this.errors = []
    try {
      localStorage.removeItem("system_errors")
    } catch (e) {
      console.warn("Failed to clear errors from localStorage")
    }
  }

  getHealthStatus(): SystemHealth | null {
    try {
      const stored = localStorage.getItem("system_health")
      return stored ? JSON.parse(stored) : null
    } catch (e) {
      return null
    }
  }

  destroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
  }
}

export const systemMonitor = new SystemMonitor()

// Data validation utilities
export class DataValidator {
  static validateTrip(trip: any): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!trip.title || typeof trip.title !== "string" || trip.title.trim().length < 3) {
      errors.push("Trip title must be at least 3 characters long")
    }

    if (!trip.location || typeof trip.location !== "string" || trip.location.trim().length < 3) {
      errors.push("Trip location must be at least 3 characters long")
    }

    if (!trip.startDate || !trip.endDate) {
      errors.push("Trip must have valid start and end dates")
    } else {
      const startDate = new Date(trip.startDate)
      const endDate = new Date(trip.endDate)
      if (startDate >= endDate) {
        errors.push("End date must be after start date")
      }
      if (startDate < new Date()) {
        errors.push("Start date cannot be in the past")
      }
    }

    if (!trip.price || typeof trip.price !== "number" || trip.price <= 0) {
      errors.push("Trip price must be a positive number")
    }

    if (!trip.capacity || typeof trip.capacity !== "number" || trip.capacity <= 0) {
      errors.push("Trip capacity must be a positive number")
    }

    if (trip.availableSeats < 0 || trip.availableSeats > trip.capacity) {
      errors.push("Available seats must be between 0 and total capacity")
    }

    return { valid: errors.length === 0, errors }
  }

  static validateBooking(booking: any): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!booking.customerName || typeof booking.customerName !== "string" || booking.customerName.trim().length < 2) {
      errors.push("Customer name must be at least 2 characters long")
    }

    if (
      !booking.customerEmail ||
      typeof booking.customerEmail !== "string" ||
      !this.isValidEmail(booking.customerEmail)
    ) {
      errors.push("Valid customer email is required")
    }

    if (
      !booking.customerPhone ||
      typeof booking.customerPhone !== "string" ||
      booking.customerPhone.trim().length < 10
    ) {
      errors.push("Valid customer phone number is required")
    }

    if (!booking.numberOfTravelers || typeof booking.numberOfTravelers !== "number" || booking.numberOfTravelers <= 0) {
      errors.push("Number of travelers must be a positive number")
    }

    if (!booking.totalAmount || typeof booking.totalAmount !== "number" || booking.totalAmount <= 0) {
      errors.push("Total amount must be a positive number")
    }

    if (booking.travelers && Array.isArray(booking.travelers)) {
      booking.travelers.forEach((traveler: any, index: number) => {
        if (!traveler.name || typeof traveler.name !== "string" || traveler.name.trim().length < 2) {
          errors.push(`Traveler ${index + 1} name is required`)
        }
        if (!traveler.age || typeof traveler.age !== "number" || traveler.age < 1 || traveler.age > 120) {
          errors.push(`Traveler ${index + 1} age must be between 1 and 120`)
        }
      })
    }

    return { valid: errors.length === 0, errors }
  }

  static validateBlogPost(blog: any): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!blog.title || typeof blog.title !== "string" || blog.title.trim().length < 5) {
      errors.push("Blog title must be at least 5 characters long")
    }

    if (!blog.slug || typeof blog.slug !== "string" || blog.slug.trim().length < 3) {
      errors.push("Blog slug must be at least 3 characters long")
    }

    if (!blog.excerpt || typeof blog.excerpt !== "string" || blog.excerpt.trim().length < 20) {
      errors.push("Blog excerpt must be at least 20 characters long")
    }

    if (!blog.content || typeof blog.content !== "string" || blog.content.trim().length < 100) {
      errors.push("Blog content must be at least 100 characters long")
    }

    if (!blog.author || typeof blog.author !== "string" || blog.author.trim().length < 2) {
      errors.push("Blog author is required")
    }

    if (blog.tags && Array.isArray(blog.tags)) {
      if (blog.tags.length === 0) {
        errors.push("At least one tag is required")
      }
      blog.tags.forEach((tag: any, index: number) => {
        if (typeof tag !== "string" || tag.trim().length < 2) {
          errors.push(`Tag ${index + 1} must be at least 2 characters long`)
        }
      })
    }

    return { valid: errors.length === 0, errors }
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map()

  static startTiming(operation: string): () => void {
    const startTime = performance.now()

    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime

      if (!this.metrics.has(operation)) {
        this.metrics.set(operation, [])
      }

      const operationMetrics = this.metrics.get(operation)!
      operationMetrics.push(duration)

      // Keep only the last 100 measurements
      if (operationMetrics.length > 100) {
        operationMetrics.shift()
      }

      // Log slow operations
      if (duration > 1000) {
        // More than 1 second
        systemMonitor.logError({
          level: "warning",
          component: "Performance",
          message: `Slow operation detected: ${operation}`,
          context: { duration: `${duration.toFixed(2)}ms` },
        })
      }
    }
  }

  static getMetrics(operation?: string): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {}

    const operations = operation ? [operation] : Array.from(this.metrics.keys())

    operations.forEach((op) => {
      const measurements = this.metrics.get(op) || []
      if (measurements.length > 0) {
        result[op] = {
          avg: measurements.reduce((sum, val) => sum + val, 0) / measurements.length,
          min: Math.min(...measurements),
          max: Math.max(...measurements),
          count: measurements.length,
        }
      }
    })

    return result
  }

  static clearMetrics() {
    this.metrics.clear()
  }
}
