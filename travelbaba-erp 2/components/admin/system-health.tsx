"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { systemMonitor, PerformanceMonitor, type SystemHealth, type SystemError } from "@/lib/system-monitor"

export function SystemHealthDashboard() {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [errors, setErrors] = useState<SystemError[]>([])
  const [performanceMetrics, setPerformanceMetrics] = useState<Record<string, any>>({})

  useEffect(() => {
    const updateHealth = () => {
      const currentHealth = systemMonitor.performHealthCheck()
      setHealth(currentHealth)
      setErrors(systemMonitor.getErrors())
      setPerformanceMetrics(PerformanceMonitor.getMetrics())
    }

    updateHealth()
    const interval = setInterval(updateHealth, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: SystemHealth["status"]) => {
    switch (status) {
      case "healthy":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "critical":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusIcon = (status: SystemHealth["status"]) => {
    switch (status) {
      case "healthy":
        return "fas fa-check-circle"
      case "warning":
        return "fas fa-exclamation-triangle"
      case "critical":
        return "fas fa-times-circle"
      default:
        return "fas fa-question-circle"
    }
  }

  const handleClearErrors = () => {
    systemMonitor.clearErrors()
    setErrors([])
  }

  const handleClearMetrics = () => {
    PerformanceMonitor.clearMetrics()
    setPerformanceMetrics({})
  }

  if (!health) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-2xl text-muted-foreground mb-2"></i>
            <p className="text-muted-foreground">Loading system health...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* System Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <i className={`${getStatusIcon(health.status)} ${getStatusColor(health.status)}`}></i>
                <span>System Health</span>
              </CardTitle>
              <CardDescription>Last updated: {new Date(health.timestamp).toLocaleString()}</CardDescription>
            </div>
            <Badge
              variant={
                health.status === "healthy" ? "default" : health.status === "warning" ? "secondary" : "destructive"
              }
              className="text-sm"
            >
              {health.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{health.metrics.totalTrips}</div>
              <div className="text-sm text-muted-foreground">Total Trips</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{health.metrics.totalBookings}</div>
              <div className="text-sm text-muted-foreground">Total Bookings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{health.metrics.totalCustomers}</div>
              <div className="text-sm text-muted-foreground">Total Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{health.metrics.totalBlogs}</div>
              <div className="text-sm text-muted-foreground">Total Blogs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{Math.round(health.metrics.dataSize / 1024)}KB</div>
              <div className="text-sm text-muted-foreground">Data Size</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="checks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="checks">System Checks</TabsTrigger>
          <TabsTrigger value="errors">Error Log</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="checks">
          <Card>
            <CardHeader>
              <CardTitle>Component Health Checks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i
                      className={`fas ${health.checks.dataStore ? "fa-check-circle text-green-600" : "fa-times-circle text-red-600"}`}
                    ></i>
                    <span className="font-medium">Data Store</span>
                  </div>
                  <Badge variant={health.checks.dataStore ? "default" : "destructive"}>
                    {health.checks.dataStore ? "Healthy" : "Failed"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i
                      className={`fas ${health.checks.localStorage ? "fa-check-circle text-green-600" : "fa-times-circle text-red-600"}`}
                    ></i>
                    <span className="font-medium">Local Storage</span>
                  </div>
                  <Badge variant={health.checks.localStorage ? "default" : "destructive"}>
                    {health.checks.localStorage ? "Available" : "Unavailable"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i
                      className={`fas ${health.checks.paymentService ? "fa-check-circle text-green-600" : "fa-exclamation-triangle text-yellow-600"}`}
                    ></i>
                    <span className="font-medium">Payment Service</span>
                  </div>
                  <Badge variant={health.checks.paymentService ? "default" : "secondary"}>
                    {health.checks.paymentService ? "Ready" : "Limited"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i
                      className={`fas fa-memory ${health.checks.memoryUsage > 100 ? "text-yellow-600" : "text-green-600"}`}
                    ></i>
                    <span className="font-medium">Memory Usage</span>
                  </div>
                  <Badge variant={health.checks.memoryUsage > 100 ? "secondary" : "default"}>
                    {health.checks.memoryUsage.toFixed(1)} MB
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i
                      className={`fas fa-exclamation-triangle ${health.checks.errorCount > 5 ? "text-red-600" : "text-green-600"}`}
                    ></i>
                    <span className="font-medium">Error Count</span>
                  </div>
                  <Badge variant={health.checks.errorCount > 5 ? "destructive" : "default"}>
                    {health.checks.errorCount} errors
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>System Error Log</CardTitle>
                  <CardDescription>Recent system errors and warnings</CardDescription>
                </div>
                <Button onClick={handleClearErrors} variant="outline" size="sm">
                  <i className="fas fa-trash mr-2"></i>
                  Clear Errors
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {errors.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Component</TableHead>
                        <TableHead>Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {errors.slice(0, 20).map((error) => (
                        <TableRow key={error.id}>
                          <TableCell className="text-sm">{new Date(error.timestamp).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                error.level === "critical"
                                  ? "destructive"
                                  : error.level === "error"
                                    ? "destructive"
                                    : error.level === "warning"
                                      ? "secondary"
                                      : "outline"
                              }
                              className="text-xs"
                            >
                              {error.level}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{error.component}</TableCell>
                          <TableCell className="text-sm">{error.message}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-check-circle text-4xl text-green-600 mb-4"></i>
                  <p className="text-muted-foreground">No errors recorded</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Operation timing and performance data</CardDescription>
                </div>
                <Button onClick={handleClearMetrics} variant="outline" size="sm">
                  <i className="fas fa-trash mr-2"></i>
                  Clear Metrics
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {Object.keys(performanceMetrics).length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Operation</TableHead>
                        <TableHead>Count</TableHead>
                        <TableHead>Avg Time</TableHead>
                        <TableHead>Min Time</TableHead>
                        <TableHead>Max Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(performanceMetrics).map(([operation, metrics]) => (
                        <TableRow key={operation}>
                          <TableCell className="font-medium">{operation}</TableCell>
                          <TableCell>{metrics.count}</TableCell>
                          <TableCell>{metrics.avg.toFixed(2)}ms</TableCell>
                          <TableCell>{metrics.min.toFixed(2)}ms</TableCell>
                          <TableCell>
                            <span className={metrics.max > 1000 ? "text-red-600 font-semibold" : ""}>
                              {metrics.max.toFixed(2)}ms
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-chart-line text-4xl text-muted-foreground mb-4"></i>
                  <p className="text-muted-foreground">No performance data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
