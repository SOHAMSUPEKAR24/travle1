"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { dataStore, type BlogPost } from "@/lib/data-store"

export default function BlogDetailPage() {
  const params = useParams()
  const [blog, setBlog] = useState<BlogPost | null>(null)
  const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.slug) {
      const foundBlog = dataStore.getBlogBySlug(params.slug as string)
      setBlog(foundBlog || null)

      if (foundBlog) {
        // Find related blogs with similar tags
        const related = dataStore
          .getBlogs()
          .filter((b) => b.published && b.id !== foundBlog.id && b.tags.some((tag) => foundBlog.tags.includes(tag)))
          .slice(0, 3)
        setRelatedBlogs(related)
      }

      setLoading(false)
    }
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-gold mb-4"></i>
            <p className="text-muted-foreground">Loading article...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-6xl text-muted-foreground mb-6"></i>
            <h1 className="text-3xl font-bold text-foreground mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The article you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/blogs">
              <Button variant="outline">Back to Blog</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-warm">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {blog.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-deep-brown mb-6">{blog.title}</h1>
          <p className="text-xl text-brown mb-8">{blog.excerpt}</p>
          <div className="flex items-center space-x-6 text-brown">
            <div className="flex items-center">
              <i className="fas fa-user mr-2"></i>
              {blog.author}
            </div>
            <div className="flex items-center">
              <i className="fas fa-calendar mr-2"></i>
              {new Date(blog.date).toLocaleDateString()}
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <img
                src={blog.cover || "/placeholder.svg"}
                alt={blog.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
              />

              <div className="prose prose-lg max-w-none">
                {/* Simple markdown-like content rendering */}
                {blog.content.split("\n").map((paragraph, index) => {
                  if (paragraph.startsWith("# ")) {
                    return (
                      <h1 key={index} className="text-3xl font-bold text-deep-brown mt-8 mb-4">
                        {paragraph.replace("# ", "")}
                      </h1>
                    )
                  }
                  if (paragraph.startsWith("## ")) {
                    return (
                      <h2 key={index} className="text-2xl font-semibold text-deep-brown mt-6 mb-3">
                        {paragraph.replace("## ", "")}
                      </h2>
                    )
                  }
                  if (paragraph.startsWith("### ")) {
                    return (
                      <h3 key={index} className="text-xl font-semibold text-deep-brown mt-4 mb-2">
                        {paragraph.replace("### ", "")}
                      </h3>
                    )
                  }
                  if (paragraph.trim() === "") {
                    return <br key={index} />
                  }
                  return (
                    <p key={index} className="text-muted-foreground leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  )
                })}
              </div>

              {/* Share Section */}
              <div className="mt-12 pt-8 border-t border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Share this article</h3>
                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const url = window.location.href
                      const text = `Check out this article: ${blog.title}`
                      if (navigator.share) {
                        navigator.share({ title: blog.title, text, url })
                      } else {
                        navigator.clipboard.writeText(url)
                        alert("Link copied to clipboard!")
                      }
                    }}
                  >
                    <i className="fas fa-share mr-2"></i>
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        `${blog.title} - ${window.location.href}`,
                      )}`
                      window.open(twitterUrl, "_blank")
                    }}
                  >
                    <i className="fab fa-twitter mr-2"></i>
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                        window.location.href,
                      )}`
                      window.open(facebookUrl, "_blank")
                    }}
                  >
                    <i className="fab fa-facebook mr-2"></i>
                    Facebook
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Author Info */}
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-foreground mb-2">About the Author</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {blog.author === "Team TravelBabaVoyage"
                        ? "Our expert travel team brings you insights from years of exploring India's incredible destinations."
                        : `Written by ${blog.author}, a passionate traveler and storyteller.`}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Published on {new Date(blog.date).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>

                {/* Related Articles */}
                {relatedBlogs.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-foreground mb-4">Related Articles</h4>
                      <div className="space-y-4">
                        {relatedBlogs.map((relatedBlog) => (
                          <Link key={relatedBlog.id} href={`/blogs/${relatedBlog.slug}`}>
                            <div className="group cursor-pointer">
                              <img
                                src={relatedBlog.cover || "/placeholder.svg"}
                                alt={relatedBlog.title}
                                className="w-full h-24 object-cover rounded mb-2 group-hover:opacity-80 transition-opacity"
                              />
                              <h5 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                {relatedBlog.title}
                              </h5>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(relatedBlog.date).toLocaleDateString()}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
