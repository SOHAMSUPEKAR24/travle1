"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false)

  const insertMarkdown = (before: string, after = "") => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)

    onChange(newText)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    }, 0)
  }

  const renderMarkdown = (text: string) => {
    return text.split("\n").map((line, index) => {
      if (line.startsWith("# ")) {
        return (
          <h1 key={index} className="text-3xl font-bold mb-4">
            {line.replace("# ", "")}
          </h1>
        )
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={index} className="text-2xl font-semibold mb-3">
            {line.replace("## ", "")}
          </h2>
        )
      }
      if (line.startsWith("### ")) {
        return (
          <h3 key={index} className="text-xl font-semibold mb-2">
            {line.replace("### ", "")}
          </h3>
        )
      }
      if (line.trim() === "") {
        return <br key={index} />
      }
      return (
        <p key={index} className="mb-4 leading-relaxed">
          {line}
        </p>
      )
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Button type="button" variant="outline" size="sm" onClick={() => insertMarkdown("**", "**")}>
            <i className="fas fa-bold"></i>
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => insertMarkdown("*", "*")}>
            <i className="fas fa-italic"></i>
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => insertMarkdown("# ", "")}>
            H1
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => insertMarkdown("## ", "")}>
            H2
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => insertMarkdown("- ", "")}>
            <i className="fas fa-list"></i>
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => insertMarkdown("[", "](url)")}>
            <i className="fas fa-link"></i>
          </Button>
        </div>

        <Button type="button" variant="outline" size="sm" onClick={() => setIsPreview(!isPreview)}>
          {isPreview ? "Edit" : "Preview"}
        </Button>
      </div>

      {isPreview ? (
        <div className="border rounded-lg p-4 min-h-[300px] bg-background">
          <div className="prose max-w-none">{renderMarkdown(value)}</div>
        </div>
      ) : (
        <Textarea
          id="content"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={15}
          placeholder={placeholder}
          className="font-mono"
        />
      )}
    </div>
  )
}
