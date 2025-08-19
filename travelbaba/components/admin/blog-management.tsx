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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { dataStore, type BlogPost } from "@/lib/data-store"

export function BlogManagement() {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    cover: "",
    author: "Team TravelBabaVoyage",
    tags: "",
    content: "",
    published: false,
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    readingTime: 0,
  })

  const [analytics, setAnalytics] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0,
    avgReadingTime: 0,
  })

  useEffect(() => {
    loadBlogs()
    calculateAnalytics()
  }, [])

  const loadBlogs = () => {
    setBlogs(dataStore.getBlogs())
  }

  const calculateAnalytics = () => {
    const allBlogs = dataStore.getBlogs()
    const published = allBlogs.filter((blog) => blog.published)
    const drafts = allBlogs.filter((blog) => !blog.published)

    const avgReadingTime =
      allBlogs.length > 0
        ? Math.round(allBlogs.reduce((sum, blog) => sum + estimateReadingTime(blog.content), 0) / allBlogs.length)
        : 0

    setAnalytics({
      totalPosts: allBlogs.length,
      publishedPosts: published.length,
      draftPosts: drafts.length,
      totalViews: Math.floor(Math.random() * 10000), // Simulated views
      avgReadingTime,
    })
  }

  const estimateReadingTime = (content: string): number => {
    const wordsPerMinute = 200
    const wordCount = content.split(/\s+/).length
    return Math.ceil(wordCount / wordsPerMinute)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      cover: "",
      author: "Team TravelBabaVoyage",
      tags: "",
      content: "",
      published: false,
      metaTitle: "",
      metaDescription: "",
      keywords: "",
      readingTime: 0,
    })
    setEditingBlog(null)
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: formData.slug || generateSlug(title),
      metaTitle: formData.metaTitle || title,
    })
  }

  const handleEdit = (blog: BlogPost) => {
    setEditingBlog(blog)
    setFormData({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      cover: blog.cover,
      author: blog.author,
      tags: blog.tags.join(", "),
      content: blog.content,
      published: blog.published,
      metaTitle: (blog as any).metaTitle || blog.title,
      metaDescription: (blog as any).metaDescription || blog.excerpt,
      keywords: (blog as any).keywords || blog.tags.join(", "),
      readingTime: estimateReadingTime(blog.content),
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const blogData = {
      title: formData.title,
      slug: formData.slug || generateSlug(formData.title),
      excerpt: formData.excerpt,
      cover: formData.cover || "/blog-post-cover.png",
      author: formData.author,
      date: editingBlog?.date || new Date().toISOString().split("T")[0],
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      content: formData.content,
      published: formData.published,
      metaTitle: formData.metaTitle || formData.title,
      metaDescription: formData.metaDescription || formData.excerpt,
      keywords: formData.keywords,
      readingTime: estimateReadingTime(formData.content),
    }

    try {
      if (editingBlog) {
        dataStore.updateBlog(editingBlog.id, blogData)
        toast({
          title: "Blog Post Updated",
          description: "Blog post has been updated successfully.",
        })
      } else {
        dataStore.addBlog(blogData)
        toast({
          title: "Blog Post Created",
          description: "New blog post has been created successfully.",
        })
      }

      loadBlogs()
      calculateAnalytics()
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save blog post. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = (blogId: string) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      try {
        dataStore.deleteBlog(blogId)
        toast({
          title: "Blog Post Deleted",
          description: "Blog post has been deleted successfully.",
        })
        loadBlogs()
        calculateAnalytics()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete blog post.",
          variant: "destructive",
        })
      }
    }
  }

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Blog Management</CardTitle>
            <CardDescription>Manage your blog posts and articles</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="btn-primary">
                <i className="fas fa-plus mr-2"></i>
                Add Blog Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingBlog ? "Edit Blog Post" : "Add New Blog Post"}</DialogTitle>
                <DialogDescription>
                  {editingBlog ? "Update your blog post" : "Create a new blog post or article"}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="seo">SEO & Meta</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Post Title</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => handleTitleChange(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="slug">URL Slug</Label>
                        <Input
                          id="slug"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          placeholder="auto-generated-from-title"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="excerpt">Excerpt</Label>
                      <Textarea
                        id="excerpt"
                        value={formData.excerpt}
                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                        rows={2}
                        placeholder="Brief description of the blog post"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="cover">Cover Image URL</Label>
                      <Input
                        id="cover"
                        value={formData.cover}
                        onChange={(e) => setFormData({ ...formData, cover: e.target.value })}
                        placeholder="Leave empty for auto-generated placeholder"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="author">Author</Label>
                        <Input
                          id="author"
                          value={formData.author}
                          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                        <Input
                          id="tags"
                          value={formData.tags}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                          placeholder="Travel, Culture, Tips"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="content">Content (Markdown)</Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        rows={15}
                        placeholder="Write your blog post content in Markdown format..."
                        className="font-mono"
                        required
                      />
                      <div className="text-sm text-muted-foreground mt-1">
                        Estimated reading time: {estimateReadingTime(formData.content)} min
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="published"
                        checked={formData.published}
                        onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                      />
                      <Label htmlFor="published">Publish immediately</Label>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="seo" className="space-y-4">
                  <div>
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      placeholder="SEO optimized title"
                    />
                    <div className="text-sm text-muted-foreground mt-1">{formData.metaTitle.length}/60 characters</div>
                  </div>

                  <div>
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      rows={3}
                      placeholder="SEO description for search engines"
                    />
                    <div className="text-sm text-muted-foreground mt-1">
                      {formData.metaDescription.length}/160 characters
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="keywords">Keywords</Label>
                    <Input
                      id="keywords"
                      value={formData.keywords}
                      onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                      placeholder="SEO keywords, comma-separated"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="space-y-4">
                  <div className="border rounded-lg p-6 bg-background">
                    <h2 className="text-2xl font-bold mb-2">{formData.title || "Blog Post Title"}</h2>
                    <p className="text-muted-foreground mb-4">{formData.excerpt || "Blog post excerpt..."}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-6">
                      <span>By {formData.author}</span>
                      <span>•</span>
                      <span>{estimateReadingTime(formData.content)} min read</span>
                    </div>
                    <div className="prose max-w-none">
                      {formData.content
                        .split("\n")
                        .slice(0, 5)
                        .map((line, index) => (
                          <p key={index} className="mb-2">
                            {line}
                          </p>
                        ))}
                      {formData.content.split("\n").length > 5 && (
                        <p className="text-muted-foreground italic">... (content continues)</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className="btn-primary">
                  {editingBlog ? "Update Blog Post" : "Create Blog Post"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{analytics.totalPosts}</div>
              <div className="text-sm text-muted-foreground">Total Posts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{analytics.publishedPosts}</div>
              <div className="text-sm text-muted-foreground">Published</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{analytics.draftPosts}</div>
              <div className="text-sm text-muted-foreground">Drafts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{analytics.totalViews.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Views</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{analytics.avgReadingTime}m</div>
              <div className="text-sm text-muted-foreground">Avg. Read Time</div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-4">
          <Input
            placeholder="Search blog posts by title, excerpt, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Post</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBlogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell>
                    <div className="flex items-start space-x-3">
                      <img
                        src={blog.cover || "/placeholder.svg"}
                        alt={blog.title}
                        className="w-16 h-12 rounded object-cover"
                      />
                      <div>
                        <div className="font-medium">{blog.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">{blog.excerpt}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {estimateReadingTime(blog.content)} min read
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{blog.author}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {blog.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {blog.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{blog.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={blog.published ? "default" : "secondary"}>
                      {blog.published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">{new Date(blog.date).toLocaleDateString()}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(blog)}>
                        <i className="fas fa-edit mr-1"></i>
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(blog.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <i className="fas fa-trash mr-1"></i>
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredBlogs.length === 0 && (
          <div className="text-center py-8">
            <i className="fas fa-blog text-4xl text-muted-foreground mb-4"></i>
            <p className="text-muted-foreground">No blog posts found. Create your first blog post to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
