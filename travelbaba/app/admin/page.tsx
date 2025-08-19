"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AdminHeader } from "@/components/admin/admin-header"
import { LoginForm } from "@/components/admin/login-form"
import { TripManagement } from "@/components/admin/trip-management"
import { TestimonialManagement } from "@/components/admin/testimonial-management"
import { BlogManagement } from "@/components/admin/blog-management"
import { BookingManagement } from "@/components/admin/booking-management"
import { CustomerManagement } from "@/components/admin/customer-management"
import { SettingsManagement } from "@/components/admin/settings-management"
import { SystemHealthDashboard } from "@/components/admin/system-health"
import { dataStore } from "@/lib/data-store"
import { authService, type AuthState } from "@/lib/auth"

export default function AdminPage() {
  const [authState, setAuthState] = useState<AuthState>({ isAuthenticated: false, username: null })
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalBookings: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    activeTrips: 0,
    pendingBookings: 0,
  })

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.subscribe(setAuthState)

    // Set initial auth state
    setAuthState(authService.getAuthState())

    return unsubscribe
  }, [])

  useEffect(() => {
    if (!authState.isAuthenticated) return

    const updateStats = () => {
      const trips = dataStore.getTrips()
      const bookings = dataStore.getBookings()
      const customers = dataStore.getCustomers()

      const totalRevenue = bookings
        .filter((booking) => booking.paymentStatus === "completed")
        .reduce((sum, booking) => sum + booking.totalAmount, 0)

      const activeTrips = trips.filter((trip) => new Date(trip.startDate) > new Date()).length
      const pendingBookings = bookings.filter((booking) => booking.paymentStatus === "pending").length

      setStats({
        totalTrips: trips.length,
        totalBookings: bookings.length,
        totalCustomers: customers.length,
        totalRevenue,
        activeTrips,
        pendingBookings,
      })
    }

    updateStats()
    // Update stats every 30 seconds
    const interval = setInterval(updateStats, 30000)
    return () => clearInterval(interval)
  }, [authState.isAuthenticated])

  // Show login form if not authenticated
  if (!authState.isAuthenticated) {
    return <LoginForm onLogin={() => {}} />
  }

  return (
    <div className="min-h-screen bg-soft-gray">
      <AdminHeader />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Overview */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-deep-brown mb-2">Welcome back, {authState.username}!</h1>
          <p className="text-brown">Manage your travel business operations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
              <i className="fas fa-route text-gold"></i>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-deep-brown">{stats.totalTrips}</div>
              <p className="text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-xs">
                  {stats.activeTrips} active
                </Badge>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <i className="fas fa-calendar-check text-gold"></i>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-deep-brown">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {stats.pendingBookings} pending
                </Badge>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <i className="fas fa-users text-gold"></i>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-deep-brown">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">Total registered</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <i className="fas fa-rupee-sign text-gold"></i>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-deep-brown">₹{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total earned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Trip Value</CardTitle>
              <i className="fas fa-chart-line text-gold"></i>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-deep-brown">
                ₹{stats.totalBookings > 0 ? Math.round(stats.totalRevenue / stats.totalBookings).toLocaleString() : 0}
              </div>
              <p className="text-xs text-muted-foreground">Per booking</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion</CardTitle>
              <i className="fas fa-percentage text-gold"></i>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-deep-brown">
                {stats.totalCustomers > 0 ? Math.round((stats.totalBookings / stats.totalCustomers) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Customer to booking</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="trips" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="trips">Trips</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="testimonials">Reviews</TabsTrigger>
            <TabsTrigger value="blogs">Blogs</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="trips">
            <TripManagement />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingManagement />
          </TabsContent>

          <TabsContent value="customers">
            <CustomerManagement />
          </TabsContent>

          <TabsContent value="testimonials">
            <TestimonialManagement />
          </TabsContent>

          <TabsContent value="blogs">
            <BlogManagement />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsManagement />
          </TabsContent>

          <TabsContent value="system">
            <SystemHealthDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
