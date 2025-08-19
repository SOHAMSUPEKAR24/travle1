"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export function SettingsManagement() {
  const { toast } = useToast()

  const [siteSettings, setSiteSettings] = useState({
    siteName: "TravelBabaVoyage",
    contactEmail: "info@travelbabavoyage.com",
    contactPhone: "+91 98765 43210",
    address: "Mumbai, Maharashtra, India",
    instagramUrl: "https://instagram.com/travelbabavoyage",
    facebookUrl: "https://facebook.com/travelbabavoyage",
    heroTitle: "Discover India's Hidden Treasures",
    heroSubtitle:
      "Curated journeys, cultural immersions, and unforgettable experiences across the incredible landscapes of India",
    aboutText:
      "We are passionate travel curators dedicated to showcasing the incredible diversity and beauty of India through carefully crafted experiences.",
  })

  const handleSave = () => {
    // In a real implementation, this would save to the data store
    toast({
      title: "Settings Saved",
      description: "Your site settings have been updated successfully.",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Site Settings</CardTitle>
          <CardDescription>Manage your website's basic information and content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={siteSettings.siteName}
                onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={siteSettings.contactEmail}
                onChange={(e) => setSiteSettings({ ...siteSettings, contactEmail: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                value={siteSettings.contactPhone}
                onChange={(e) => setSiteSettings({ ...siteSettings, contactPhone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={siteSettings.address}
                onChange={(e) => setSiteSettings({ ...siteSettings, address: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="instagramUrl">Instagram URL</Label>
              <Input
                id="instagramUrl"
                value={siteSettings.instagramUrl}
                onChange={(e) => setSiteSettings({ ...siteSettings, instagramUrl: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="facebookUrl">Facebook URL</Label>
              <Input
                id="facebookUrl"
                value={siteSettings.facebookUrl}
                onChange={(e) => setSiteSettings({ ...siteSettings, facebookUrl: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Homepage Content</CardTitle>
          <CardDescription>Customize your homepage hero section and content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="heroTitle">Hero Title</Label>
            <Input
              id="heroTitle"
              value={siteSettings.heroTitle}
              onChange={(e) => setSiteSettings({ ...siteSettings, heroTitle: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
            <Textarea
              id="heroSubtitle"
              value={siteSettings.heroSubtitle}
              onChange={(e) => setSiteSettings({ ...siteSettings, heroSubtitle: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="aboutText">About Text</Label>
            <Textarea
              id="aboutText"
              value={siteSettings.aboutText}
              onChange={(e) => setSiteSettings({ ...siteSettings, aboutText: e.target.value })}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>Technical details and system status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-muted-foreground">Data Storage</div>
              <div>Browser LocalStorage</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Last Backup</div>
              <div>Manual export required</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Version</div>
              <div>1.0.0</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Environment</div>
              <div>Development</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="btn-primary">
          <i className="fas fa-save mr-2"></i>
          Save Settings
        </Button>
      </div>
    </div>
  )
}
