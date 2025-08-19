"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { dataStore, type Customer, type Booking } from "@/lib/data-store"

export function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSegment, setFilterSegment] = useState("all")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const { toast } = useToast()

  const [analytics, setAnalytics] = useState({
    totalCustomers: 0,
    newThisMonth: 0,
    repeatCustomers: 0,
    avgSpending: 0,
    topSpenders: [] as Customer[],
    segments: {
      vip: 0,
      regular: 0,
      new: 0,
      inactive: 0,
    },
  })

  const [emailData, setEmailData] = useState({
    subject: "",
    message: "",
    recipients: "selected" as "selected" | "segment" | "all",
    segment: "all",
  })

  useEffect(() => {
    loadData()
    calculateAnalytics()
  }, [])

  const loadData = () => {
    setCustomers(dataStore.getCustomers())
    setBookings(dataStore.getBookings())
  }

  const calculateAnalytics = () => {
    const allCustomers = dataStore.getCustomers()
    const allBookings = dataStore.getBookings()

    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const newThisMonth = allCustomers.filter((customer) => {
      const createdDate = new Date(customer.createdAt)
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear
    }).length

    const repeatCustomers = allCustomers.filter((customer) => customer.bookings.length > 1).length

    const totalSpending = allCustomers.reduce((sum, customer) => sum + customer.totalSpent, 0)
    const avgSpending = allCustomers.length > 0 ? totalSpending / allCustomers.length : 0

    const topSpenders = [...allCustomers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5)

    // Customer segmentation
    const vipCustomers = allCustomers.filter((customer) => customer.totalSpent > 100000).length
    const regularCustomers = allCustomers.filter(
      (customer) => customer.totalSpent > 25000 && customer.totalSpent <= 100000,
    ).length
    const newCustomers = allCustomers.filter((customer) => customer.bookings.length === 0).length
    const inactiveCustomers = allCustomers.filter((customer) => {
      const lastBooking =
        customer.bookings.length > 0
          ? Math.max(
              ...customer.bookings.map((id) => {
                const booking = allBookings.find((b) => b.id === id)
                return booking ? new Date(booking.bookingDate).getTime() : 0
              }),
            )
          : 0
      const sixMonthsAgo = Date.now() - 6 * 30 * 24 * 60 * 60 * 1000
      return lastBooking < sixMonthsAgo && customer.bookings.length > 0
    }).length

    setAnalytics({
      totalCustomers: allCustomers.length,
      newThisMonth,
      repeatCustomers,
      avgSpending,
      topSpenders,
      segments: {
        vip: vipCustomers,
        regular: regularCustomers,
        new: newCustomers,
        inactive: inactiveCustomers,
      },
    })
  }

  const getCustomerSegment = (customer: Customer): string => {
    if (customer.totalSpent > 100000) return "VIP"
    if (customer.totalSpent > 25000) return "Regular"
    if (customer.bookings.length === 0) return "New"

    const lastBooking =
      customer.bookings.length > 0
        ? Math.max(
            ...customer.bookings.map((id) => {
              const booking = bookings.find((b) => b.id === id)
              return booking ? new Date(booking.bookingDate).getTime() : 0
            }),
          )
        : 0
    const sixMonthsAgo = Date.now() - 6 * 30 * 24 * 60 * 60 * 1000

    if (lastBooking < sixMonthsAgo && customer.bookings.length > 0) return "Inactive"
    return "Regular"
  }

  const getCustomerBookings = (customer: Customer): Booking[] => {
    return bookings.filter((booking) => customer.bookings.includes(booking.id))
  }

  const handleSendEmail = () => {
    // Simulate email sending
    toast({
      title: "Email Sent",
      description: `Email "${emailData.subject}" sent successfully to selected customers.`,
    })
    setIsEmailDialogOpen(false)
    setEmailData({ subject: "", message: "", recipients: "selected", segment: "all" })
  }

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false

    if (filterSegment === "all") return true
    return getCustomerSegment(customer).toLowerCase() === filterSegment.toLowerCase()
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Customer Relationship Management</CardTitle>
            <CardDescription>Comprehensive customer analytics and management</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <i className="fas fa-envelope mr-2"></i>
                  Send Email
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Send Marketing Email</DialogTitle>
                  <DialogDescription>Send targeted emails to your customers</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={emailData.subject}
                      onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                      placeholder="Email subject line"
                    />
                  </div>

                  <div>
                    <Label htmlFor="recipients">Recipients</Label>
                    <Select
                      value={emailData.recipients}
                      onValueChange={(value: any) => setEmailData({ ...emailData, recipients: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="selected">Selected Customer</SelectItem>
                        <SelectItem value="segment">Customer Segment</SelectItem>
                        <SelectItem value="all">All Customers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {emailData.recipients === "segment" && (
                    <div>
                      <Label htmlFor="segment">Customer Segment</Label>
                      <Select
                        value={emailData.segment}
                        onValueChange={(value) => setEmailData({ ...emailData, segment: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Segments</SelectItem>
                          <SelectItem value="vip">VIP Customers</SelectItem>
                          <SelectItem value="regular">Regular Customers</SelectItem>
                          <SelectItem value="new">New Customers</SelectItem>
                          <SelectItem value="inactive">Inactive Customers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={emailData.message}
                      onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                      rows={6}
                      placeholder="Email content..."
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSendEmail} className="btn-primary">
                      Send Email
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button className="btn-primary">
              <i className="fas fa-download mr-2"></i>
              Export Data
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="segments">Segments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-primary">{analytics.totalCustomers}</div>
                  <div className="text-sm text-muted-foreground">Total Customers</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">{analytics.newThisMonth}</div>
                  <div className="text-sm text-muted-foreground">New This Month</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{analytics.repeatCustomers}</div>
                  <div className="text-sm text-muted-foreground">Repeat Customers</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-gold">
                    ₹{Math.round(analytics.avgSpending).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg. Spending</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Spenders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topSpenders.map((customer, index) => (
                    <div key={customer.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.email}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">₹{customer.totalSpent.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{customer.bookings.length} bookings</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Search customers by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />

              <Select value={filterSegment} onValueChange={setFilterSegment}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by segment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Segments</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Segment</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => {
                    const segment = getCustomerSegment(customer)
                    const customerBookings = getCustomerBookings(customer)
                    const lastBooking =
                      customerBookings.length > 0
                        ? customerBookings.sort(
                            (a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime(),
                          )[0]
                        : null

                    return (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className="font-medium">{customer.name}</div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">{customer.email}</div>
                            <div className="text-sm text-muted-foreground">{customer.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              segment === "VIP"
                                ? "default"
                                : segment === "Regular"
                                  ? "secondary"
                                  : segment === "New"
                                    ? "outline"
                                    : "destructive"
                            }
                          >
                            {segment}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="text-lg font-semibold">{customer.bookings.length}</div>
                            <div className="text-xs text-muted-foreground">bookings</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold">₹{customer.totalSpent.toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {lastBooking ? new Date(lastBooking.bookingDate).toLocaleDateString() : "Never"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedCustomer(customer)
                              setIsDetailDialogOpen(true)
                            }}
                          >
                            <i className="fas fa-eye mr-1"></i>
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="segments" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-gold">{analytics.segments.vip}</div>
                  <div className="text-sm text-muted-foreground">VIP Customers</div>
                  <div className="text-xs text-muted-foreground mt-1">₹100,000+ spent</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{analytics.segments.regular}</div>
                  <div className="text-sm text-muted-foreground">Regular Customers</div>
                  <div className="text-xs text-muted-foreground mt-1">₹25,000+ spent</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">{analytics.segments.new}</div>
                  <div className="text-sm text-muted-foreground">New Customers</div>
                  <div className="text-xs text-muted-foreground mt-1">No bookings yet</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-600">{analytics.segments.inactive}</div>
                  <div className="text-sm text-muted-foreground">Inactive Customers</div>
                  <div className="text-xs text-muted-foreground mt-1">6+ months inactive</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Lifetime Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Average CLV</span>
                      <span className="font-semibold">₹{Math.round(analytics.avgSpending).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Repeat Rate</span>
                      <span className="font-semibold">
                        {analytics.totalCustomers > 0
                          ? Math.round((analytics.repeatCustomers / analytics.totalCustomers) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Growth Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>New Customers (This Month)</span>
                      <span className="font-semibold">{analytics.newThisMonth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Customer Retention</span>
                      <span className="font-semibold">
                        {analytics.totalCustomers > 0
                          ? Math.round(
                              ((analytics.totalCustomers - analytics.segments.inactive) / analytics.totalCustomers) *
                                100,
                            )
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Customer Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
              <DialogDescription>
                {selectedCustomer ? `Complete profile for ${selectedCustomer.name}` : "Customer information"}
              </DialogDescription>
            </DialogHeader>

            {selectedCustomer && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <strong>Name:</strong> {selectedCustomer.name}
                      </div>
                      <div>
                        <strong>Email:</strong> {selectedCustomer.email}
                      </div>
                      <div>
                        <strong>Phone:</strong> {selectedCustomer.phone}
                      </div>
                      <div>
                        <strong>Segment:</strong>
                        <Badge
                          className="ml-2"
                          variant={getCustomerSegment(selectedCustomer) === "VIP" ? "default" : "secondary"}
                        >
                          {getCustomerSegment(selectedCustomer)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <strong>Total Bookings:</strong> {selectedCustomer.bookings.length}
                      </div>
                      <div>
                        <strong>Total Spent:</strong> ₹{selectedCustomer.totalSpent.toLocaleString()}
                      </div>
                      <div>
                        <strong>Member Since:</strong> {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                      </div>
                      <div>
                        <strong>Preferences:</strong> {selectedCustomer.preferences.join(", ") || "None"}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Booking History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getCustomerBookings(selectedCustomer).map((booking) => (
                        <div key={booking.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <div>
                            <div className="font-medium">Booking #{booking.id}</div>
                            <div className="text-sm text-muted-foreground">
                              {booking.numberOfTravelers} travelers •{" "}
                              {new Date(booking.bookingDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">₹{booking.totalAmount.toLocaleString()}</div>
                            <Badge variant={booking.paymentStatus === "completed" ? "default" : "secondary"}>
                              {booking.paymentStatus}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-8">
            <i className="fas fa-users text-4xl text-muted-foreground mb-4"></i>
            <p className="text-muted-foreground">
              {customers.length === 0 ? "No customers yet." : "No customers match your search."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
