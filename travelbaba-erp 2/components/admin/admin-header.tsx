"use client"

import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { dataStore } from "@/lib/data-store"
import { authService } from "@/lib/auth"

export function AdminHeader() {
  const [importData, setImportData] = useState("")
  const [isImporting, setIsImporting] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const { toast } = useToast()

  const handleExport = () => {
    const data = dataStore.exportData()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `travelbaba-data-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Data Exported",
      description: "Your data has been exported successfully.",
    })
  }

  const handleImport = async () => {
    if (!importData.trim()) {
      toast({
        title: "Error",
        description: "Please paste valid JSON data to import.",
        variant: "destructive",
      })
      return
    }

    setIsImporting(true)
    try {
      const success = dataStore.importData(importData)
      if (success) {
        toast({
          title: "Data Imported",
          description: "Your data has been imported successfully.",
        })
        setImportData("")
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        throw new Error("Invalid JSON format")
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Please check your JSON format and try again.",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleQuickAdd = () => {
    setShowQuickAdd(true)
    toast({
      title: "Quick Add",
      description: "Use the tabs below to quickly add trips, testimonials, or blog posts.",
    })
  }

  const handleLogout = () => {
    authService.logout()
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
  }

  return (
    <header className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-xl font-bold text-primary">
                <span className="text-gold">Travel</span>
                <span className="text-brown">Baba</span>
                <span className="text-gold">Voyage</span>
              </div>
              <Badge className="bg-gold text-white text-xs">Admin</Badge>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                <i className="fas fa-external-link-alt mr-2"></i>
                View Site
              </Link>
            </nav>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button onClick={handleExport} variant="outline" size="sm">
              <i className="fas fa-download mr-2"></i>
              Export Data
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <i className="fas fa-upload mr-2"></i>
                  Import Data
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Import Data</DialogTitle>
                  <DialogDescription>
                    Paste your JSON data below to import trips, bookings, customers, and other content.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Paste your JSON data here..."
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setImportData("")}>
                      Clear
                    </Button>
                    <Button onClick={handleImport} disabled={isImporting}>
                      {isImporting ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Importing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-upload mr-2"></i>
                          Import
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button onClick={handleQuickAdd} size="sm" className="btn-primary">
              <i className="fas fa-plus mr-2"></i>
              Quick Add
            </Button>

            {/* Logout Button */}
            <Button onClick={handleLogout} variant="outline" size="sm">
              <i className="fas fa-sign-out-alt mr-2"></i>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
