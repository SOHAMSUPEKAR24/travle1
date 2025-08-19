"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { dataStore, type Testimonial } from "@/lib/data-store"

export function TestimonialManagement() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    rating: "5",
    photo: "",
    text: "",
    featured: false,
  })

  useEffect(() => {
    loadTestimonials()
  }, [])

  const loadTestimonials = () => {
    setTestimonials(dataStore.getTestimonials())
  }

  const resetForm = () => {
    setFormData({
      name: "",
      role: "",
      rating: "5",
      photo: "",
      text: "",
      featured: false,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const testimonialData = {
      name: formData.name,
      role: formData.role,
      rating: Number.parseInt(formData.rating),
      photo: formData.photo || "/happy-customer-portrait.png",
      text: formData.text,
      featured: formData.featured,
    }

    try {
      dataStore.addTestimonial(testimonialData)
      toast({
        title: "Testimonial Added",
        description: "New testimonial has been added successfully.",
      })

      loadTestimonials()
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save testimonial. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredTestimonials = testimonials.filter(
    (testimonial) =>
      testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.text.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Testimonial Management</CardTitle>
            <CardDescription>Manage customer reviews and testimonials</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="btn-primary">
                <i className="fas fa-plus mr-2"></i>
                Add Testimonial
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Testimonial</DialogTitle>
                <DialogDescription>Add a customer review or testimonial</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Customer Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="role">Role/Trip</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g., Guest, Oct 2024 or Goa Trip Participant"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="rating">Rating</Label>
                  <select
                    id="rating"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full p-2 border border-border rounded-md"
                    required
                  >
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="photo">Photo URL</Label>
                  <Input
                    id="photo"
                    value={formData.photo}
                    onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                    placeholder="Leave empty for auto-generated placeholder"
                  />
                </div>

                <div>
                  <Label htmlFor="text">Testimonial Text</Label>
                  <Textarea
                    id="text"
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  />
                  <Label htmlFor="featured">Featured Testimonial</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="btn-primary">
                    Add Testimonial
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Search testimonials by name, role, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Testimonial</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTestimonials.map((testimonial) => (
                <TableRow key={testimonial.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <img
                        src={testimonial.photo || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <i key={i} className="fas fa-star text-gold text-sm"></i>
                      ))}
                      {[...Array(5 - testimonial.rating)].map((_, i) => (
                        <i key={i} className="far fa-star text-muted-foreground text-sm"></i>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-md">
                      <p className="text-sm line-clamp-2">{testimonial.text}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {testimonial.featured && <Badge className="bg-gold text-white">Featured</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {new Date(testimonial.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredTestimonials.length === 0 && (
          <div className="text-center py-8">
            <i className="fas fa-star text-4xl text-muted-foreground mb-4"></i>
            <p className="text-muted-foreground">No testimonials found. Add your first testimonial to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
