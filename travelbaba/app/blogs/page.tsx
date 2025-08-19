"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { dataStore, type BlogPost } from "@/lib/data-store"

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [filteredBlogs, setFilteredBlogs] = useState<BlogPost[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTag, setSelectedTag] = useState("all")

  useEffect(() => {
    const allBlogs = dataStore.getBlogs().filter((blog) => blog.published)
    setBlogs(allBlogs)
    setFilteredBlogs(allBlogs)
  }, [])

  useEffect(() => {
    let filtered = blogs

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (blog) =>
          blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.author.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by tag
    if (selectedTag !== "all") {
      filtered = filtered.filter((blog) => blog.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase()))
    }

    setFilteredBlogs(filtered)
  }, [blogs, searchTerm, selectedTag])

  const allTags = Array.from(new Set(blogs.flatMap((blog) => blog.tags)))

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-warm">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-deep-brown mb-6">Travel Blog</h1>
          <p className="text-xl text-brown max-w-3xl mx-auto leading-relaxed">
            Discover travel insights, cultural stories, and destination guides from our expert team and fellow
            travelers. Get inspired for your next adventure.
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <Input
                placeholder="Search articles by title, content, or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />

              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {allTags.map((tag) => (
                    <SelectItem key={tag} value={tag.toLowerCase()}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground">
              {filteredBlogs.length} article{filteredBlogs.length !== 1 ? "s" : ""} found
            </div>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16 bg-soft-gray">
        <div className="max-w-7xl mx-auto px-6">
          {filteredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((blog) => (
                <Card key={blog.id} className="travel-card overflow-hidden">
                  <div className="relative h-48">
                    <img
                      src={blog.cover || "/placeholder.svg"}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <CardHeader>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {blog.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <CardTitle className="text-xl line-clamp-2">{blog.title}</CardTitle>
                    <CardDescription className="line-clamp-3">{blog.excerpt}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <i className="fas fa-user mr-2"></i>
                          {blog.author}
                        </div>
                        <div className="flex items-center">
                          <i className="fas fa-calendar mr-2"></i>
                          {new Date(blog.date).toLocaleDateString()}
                        </div>
                      </div>

                      <Link href={`/blogs/${blog.slug}`}>
                        <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium transition-colors">
                          Read Article
                          <i className="fas fa-arrow-right ml-2"></i>
                        </button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <i className="fas fa-search text-6xl text-muted-foreground mb-6"></i>
              <h3 className="text-2xl font-semibold text-foreground mb-4">No articles found</h3>
              <p className="text-muted-foreground mb-8">
                Try adjusting your search criteria or browse all available articles.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedTag("all")
                }}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 rounded-md font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
