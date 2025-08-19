import { systemMonitor, DataValidator, PerformanceMonitor } from "./system-monitor"

export interface Trip {
  id: string
  title: string
  subtitle: string
  location: string
  startDate: string
  endDate: string
  price: number
  currency: string
  capacity: number
  availableSeats: number
  coverImage: string
  gallery: string[]
  categories: string[]
  highlights: string[]
  itinerary: Array<{
    day: number
    title: string
    details: string
  }>
  mapUrl: string
  featured: boolean
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Testimonial {
  id: string
  name: string
  role: string
  rating: number
  photo: string
  text: string
  tripId?: string
  createdAt: string
  featured: boolean
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  cover: string
  author: string
  date: string
  tags: string[]
  content: string
  published: boolean
  createdAt: string
  updatedAt: string
  metaTitle?: string
  metaDescription?: string
  keywords?: string
  readingTime?: number
  views?: number
}

export interface Booking {
  id: string
  tripId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  numberOfTravelers: number
  totalAmount: number
  paymentStatus: "pending" | "completed" | "failed" | "refunded"
  bookingDate: string
  specialRequests?: string
  travelers: Array<{
    name: string
    age: number
    gender: string
  }>
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  bookings: string[]
  totalSpent: number
  createdAt: string
  preferences: string[]
}

class DataStore {
  private storageKey = "travelbaba_data"

  private defaultData = {
    trips: [] as Trip[],
    testimonials: [] as Testimonial[],
    blogs: [] as BlogPost[],
    bookings: [] as Booking[],
    customers: [] as Customer[],
    settings: {
      siteName: "TravelBabaVoyage",
      contactEmail: "info@travelbabavoyage.com",
      contactPhone: "+91 98765 43210",
      address: "Mumbai, Maharashtra, India",
      socialMedia: {
        instagram: "https://instagram.com/travelbabavoyage",
        facebook: "https://facebook.com/travelbabavoyage",
      },
    },
  }

  private getData() {
    if (typeof window === "undefined") return this.defaultData

    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        return { ...this.defaultData, ...JSON.parse(stored) }
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error)
    }

    return this.defaultData
  }

  private saveData(data: any) {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data))
    } catch (error) {
      console.error("Error saving data to localStorage:", error)
    }
  }

  // Trip methods
  getTrips(): Trip[] {
    return this.getData().trips
  }

  getTripById(id: string): Trip | undefined {
    return this.getTrips().find((trip) => trip.id === id)
  }

  addTrip(trip: Omit<Trip, "id" | "createdAt" | "updatedAt">): Trip {
    const endTiming = PerformanceMonitor.startTiming("addTrip")

    try {
      // Validate trip data
      const validation = DataValidator.validateTrip(trip)
      if (!validation.valid) {
        const error = new Error(`Trip validation failed: ${validation.errors.join(", ")}`)
        systemMonitor.logError({
          level: "error",
          component: "DataStore",
          message: error.message,
          context: { trip, errors: validation.errors },
        })
        throw error
      }

      const data = this.getData()
      const newTrip: Trip = {
        ...trip,
        id: `TRIP_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      data.trips.push(newTrip)
      this.saveData(data)

      systemMonitor.logError({
        level: "info",
        component: "DataStore",
        message: `Trip created: ${newTrip.title}`,
        context: { tripId: newTrip.id },
      })

      return newTrip
    } catch (error) {
      systemMonitor.logError({
        level: "error",
        component: "DataStore",
        message: "Failed to add trip",
        context: { error: error.message, trip },
      })
      throw error
    } finally {
      endTiming()
    }
  }

  updateTrip(id: string, updates: Partial<Trip>): Trip | null {
    const data = this.getData()
    const tripIndex = data.trips.findIndex((trip) => trip.id === id)

    if (tripIndex === -1) return null

    data.trips[tripIndex] = {
      ...data.trips[tripIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    this.saveData(data)
    return data.trips[tripIndex]
  }

  deleteTrip(id: string): boolean {
    const data = this.getData()
    const initialLength = data.trips.length
    data.trips = data.trips.filter((trip) => trip.id !== id)

    if (data.trips.length < initialLength) {
      this.saveData(data)
      return true
    }
    return false
  }

  // Testimonial methods
  getTestimonials(): Testimonial[] {
    return this.getData().testimonials
  }

  addTestimonial(testimonial: Omit<Testimonial, "id" | "createdAt">): Testimonial {
    const data = this.getData()
    const newTestimonial: Testimonial = {
      ...testimonial,
      id: `TEST_${Date.now()}`,
      createdAt: new Date().toISOString(),
    }

    data.testimonials.push(newTestimonial)
    this.saveData(data)
    return newTestimonial
  }

  // Blog methods
  getBlogs(): BlogPost[] {
    return this.getData().blogs
  }

  getBlogBySlug(slug: string): BlogPost | undefined {
    return this.getBlogs().find((blog) => blog.slug === slug)
  }

  addBlog(blog: Omit<BlogPost, "id" | "createdAt" | "updatedAt">): BlogPost {
    const endTiming = PerformanceMonitor.startTiming("addBlog")

    try {
      // Validate blog data
      const validation = DataValidator.validateBlogPost(blog)
      if (!validation.valid) {
        const error = new Error(`Blog validation failed: ${validation.errors.join(", ")}`)
        systemMonitor.logError({
          level: "error",
          component: "DataStore",
          message: error.message,
          context: { blog, errors: validation.errors },
        })
        throw error
      }

      const data = this.getData()

      // Check for duplicate slug
      const existingBlog = data.blogs.find((b) => b.slug === blog.slug)
      if (existingBlog) {
        const error = new Error(`Blog with slug "${blog.slug}" already exists`)
        systemMonitor.logError({
          level: "error",
          component: "DataStore",
          message: error.message,
          context: { blog, existingBlogId: existingBlog.id },
        })
        throw error
      }

      const newBlog: BlogPost = {
        ...blog,
        id: `BLOG_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      data.blogs.push(newBlog)
      this.saveData(data)

      systemMonitor.logError({
        level: "info",
        component: "DataStore",
        message: `Blog post created: ${newBlog.title}`,
        context: { blogId: newBlog.id, slug: newBlog.slug },
      })

      return newBlog
    } catch (error) {
      systemMonitor.logError({
        level: "error",
        component: "DataStore",
        message: "Failed to add blog post",
        context: { error: error.message, blog },
      })
      throw error
    } finally {
      endTiming()
    }
  }

  updateBlog(id: string, updates: Partial<BlogPost>): BlogPost | null {
    const data = this.getData()
    const blogIndex = data.blogs.findIndex((blog) => blog.id === id)

    if (blogIndex === -1) return null

    data.blogs[blogIndex] = {
      ...data.blogs[blogIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    this.saveData(data)
    return data.blogs[blogIndex]
  }

  deleteBlog(id: string): boolean {
    const data = this.getData()
    const initialLength = data.blogs.length
    data.blogs = data.blogs.filter((blog) => blog.id !== id)

    if (data.blogs.length < initialLength) {
      this.saveData(data)
      return true
    }
    return false
  }

  // Booking methods
  getBookings(): Booking[] {
    return this.getData().bookings
  }

  addBooking(booking: Omit<Booking, "id">): Booking {
    const endTiming = PerformanceMonitor.startTiming("addBooking")

    try {
      // Validate booking data
      const validation = DataValidator.validateBooking(booking)
      if (!validation.valid) {
        const error = new Error(`Booking validation failed: ${validation.errors.join(", ")}`)
        systemMonitor.logError({
          level: "error",
          component: "DataStore",
          message: error.message,
          context: { booking, errors: validation.errors },
        })
        throw error
      }

      const data = this.getData()
      const newBooking: Booking = {
        ...booking,
        id: `BOOK_${Date.now()}`,
      }

      data.bookings.push(newBooking)
      this.saveData(data)

      systemMonitor.logError({
        level: "info",
        component: "DataStore",
        message: `Booking created for ${booking.customerName}`,
        context: { bookingId: newBooking.id, tripId: booking.tripId },
      })

      return newBooking
    } catch (error) {
      systemMonitor.logError({
        level: "error",
        component: "DataStore",
        message: "Failed to add booking",
        context: { error: error.message, booking },
      })
      throw error
    } finally {
      endTiming()
    }
  }

  // Customer methods
  getCustomers(): Customer[] {
    return this.getData().customers
  }

  addCustomer(customer: Omit<Customer, "id" | "createdAt">): Customer {
    const data = this.getData()
    const newCustomer: Customer = {
      ...customer,
      id: `CUST_${Date.now()}`,
      createdAt: new Date().toISOString(),
    }

    data.customers.push(newCustomer)
    this.saveData(data)
    return newCustomer
  }

  // Utility methods
  exportData(): string {
    const endTiming = PerformanceMonitor.startTiming("exportData")

    try {
      const data = this.getData()
      const exportData = {
        ...data,
        exportedAt: new Date().toISOString(),
        version: "1.0",
      }

      systemMonitor.logError({
        level: "info",
        component: "DataStore",
        message: "Data exported successfully",
        context: {
          trips: data.trips.length,
          bookings: data.bookings.length,
          customers: data.customers.length,
          blogs: data.blogs.length,
        },
      })

      return JSON.stringify(exportData, null, 2)
    } catch (error) {
      systemMonitor.logError({
        level: "error",
        component: "DataStore",
        message: "Failed to export data",
        context: { error: error.message },
      })
      throw error
    } finally {
      endTiming()
    }
  }

  importData(jsonData: string): boolean {
    const endTiming = PerformanceMonitor.startTiming("importData")

    try {
      const data = JSON.parse(jsonData)

      // Validate imported data structure
      if (
        !data.trips ||
        !Array.isArray(data.trips) ||
        !data.bookings ||
        !Array.isArray(data.bookings) ||
        !data.customers ||
        !Array.isArray(data.customers) ||
        !data.blogs ||
        !Array.isArray(data.blogs)
      ) {
        throw new Error("Invalid data structure")
      }

      // Create backup before import
      const currentData = this.getData()
      const backupKey = `${this.storageKey}_backup_${Date.now()}`
      localStorage.setItem(backupKey, JSON.stringify(currentData))

      this.saveData(data)

      systemMonitor.logError({
        level: "info",
        component: "DataStore",
        message: "Data imported successfully",
        context: {
          trips: data.trips.length,
          bookings: data.bookings.length,
          customers: data.customers.length,
          blogs: data.blogs.length,
          backupKey,
        },
      })

      return true
    } catch (error) {
      systemMonitor.logError({
        level: "error",
        component: "DataStore",
        message: "Failed to import data",
        context: { error: error.message },
      })
      return false
    } finally {
      endTiming()
    }
  }

  seedSampleData() {
    const data = this.getData()

    // Only seed if no data exists
    if (data.trips.length === 0) {
      // Sample trip
      data.trips.push({
        id: "TRIP_001",
        title: "Konkan–Goa: A Tour on the Water's Edge",
        subtitle: "Beaches, forts, seafood & sunsets",
        location: "Goa & Konkan Coast, India",
        startDate: "2025-11-10",
        endDate: "2025-11-16",
        price: 34999,
        currency: "INR",
        capacity: 24,
        availableSeats: 12,
        coverImage: "/goa-beach-sunset.png",
        gallery: ["/konkan-coast.png", "/goa-fort.png"],
        categories: ["Beach", "Culture", "Maharashtra", "Goa"],
        highlights: ["Dudhsagar trek", "Fort Aguada sunset", "Local seafood trail"],
        itinerary: [
          { day: 1, title: "Arrive in Goa", details: "Welcome dinner at beachside restaurant" },
          { day: 2, title: "North Goa Heritage", details: "Explore forts and churches" },
        ],
        mapUrl: "https://maps.google.com/?q=Goa",
        featured: true,
        description: "Experience the perfect blend of coastal beauty and cultural heritage along the Konkan coast.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      // Sample testimonial
      data.testimonials.push({
        id: "TEST_001",
        name: "Aarav Shah",
        role: "Guest, Oct 2024",
        rating: 5,
        photo: "/happy-traveler.png",
        text: "Flawless planning and great hosts. The Konkan-Goa trip exceeded all expectations!",
        featured: true,
        createdAt: new Date().toISOString(),
      })

      // Sample blog
      data.blogs.push({
        id: "BLOG_001",
        title: "Diwali in Maharashtra: Traditions & Trails",
        slug: "diwali-in-maharashtra-traditions",
        excerpt: "From lanterns to faral — experience the festive heart of Maharashtra.",
        cover: "/diwali-maharashtra-celebration.png",
        author: "Team TravelBabaVoyage",
        date: "2025-01-15",
        tags: ["Maharashtra", "Festivals", "Culture"],
        content: "# Diwali in Maharashtra\n\nExperience the magic of Diwali celebrations across Maharashtra...",
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      this.saveData(data)
    }
  }
}

export const dataStore = new DataStore()

// Initialize sample data on first load
if (typeof window !== "undefined") {
  dataStore.seedSampleData()
}
