'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import { common, createLowlight } from 'lowlight'
import { Button } from '@/components/ui/Button'
import { slugify } from '@/lib/utils'
import { EditorToolbar } from './EditorToolbar'
import { Notice } from '@/components/ui/Notice'
import type { PostCategory, PostVisibility } from '@/lib/postTemplates'

const lowlight = createLowlight(common)

interface PostEditorProps {
  publicationId: string
  initialData?: {
    id: string
    title: string
    content: string
    excerpt: string
    category: string
    visibility: string
    published: boolean
  }
  templateData?: {
    title: string
    content: string
    excerpt: string
    category: PostCategory
    visibility: PostVisibility
  }
}

const categories = [
  { value: 'ARTICLE', label: 'Article' },
  { value: 'SCRIPT', label: 'Script' },
  { value: 'PLUGIN', label: 'Plugin' },
  { value: 'PROMPT', label: 'Prompt' },
  { value: 'TUTORIAL', label: 'Tutorial' },
  { value: 'CONFIG', label: 'Configuration' },
]

const visibilities = [
  { value: 'FREE', label: 'Free - Anyone can read' },
  { value: 'PREVIEW', label: 'Preview - Teaser for non-subscribers' },
  { value: 'PAID', label: 'Paid - Subscribers only' },
]

export function PostEditor({ publicationId, initialData, templateData }: PostEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialData?.title ?? templateData?.title ?? '')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? templateData?.excerpt ?? '')
  const [category, setCategory] = useState(initialData?.category ?? templateData?.category ?? 'ARTICLE')
  const [visibility, setVisibility] = useState(initialData?.visibility ?? templateData?.visibility ?? 'FREE')
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [message, setMessage] = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: {
          levels: [1, 2, 3],
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript',
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        defaultProtocol: 'https',
        HTMLAttributes: {
          class: 'text-orange-600 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your post...',
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        HTMLAttributes: {
          class: 'bg-yellow-200',
        },
      }),
    ],
    content: initialData?.content ?? templateData?.content ?? '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px] px-8 py-6',
      },
    },
  })

  const handleSave = useCallback(async (publish: boolean) => {
    if (!title.trim()) {
      setMessage({ tone: 'error', text: 'Please add a title.' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const content = editor?.getHTML() || ''
      const slug = slugify(title)

      const response = await fetch('/api/posts', {
        method: initialData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: initialData?.id,
          publicationId,
          title,
          slug,
          content,
          excerpt,
          category,
          visibility,
          published: publish,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save post')
      }

      setLastSaved(new Date())
      setMessage({
        tone: 'success',
        text: publish ? 'Post published successfully.' : 'Draft saved.',
      })
      
      if (publish || !initialData) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      console.error('Error saving post:', error)
      setMessage({ tone: 'error', text: 'Failed to save post.' })
    } finally {
      setSaving(false)
    }
  }, [title, excerpt, category, visibility, editor, initialData, publicationId, router])

  // Auto-save draft every 30 seconds
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (title && editor?.getHTML()) {
  //       handleSave(false)
  //     }
  //   }, 30000)
  //   return () => clearInterval(interval)
  // }, [title, editor, handleSave])

  return (
    <div className="max-w-4xl mx-auto">
      {message && <div className="mb-4"><Notice tone={message.tone} message={message.text} /></div>}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-gray-500 hover:text-gray-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-sm text-gray-500">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={saving}
            size="sm"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving} size="sm">
            {initialData?.published ? 'Update' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Main Editor Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Title */}
        <div className="px-8 pt-8">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title..."
            className="w-full text-4xl font-bold border-0 focus:ring-0 bg-transparent placeholder-gray-300 p-0"
          />
        </div>

        {/* Excerpt */}
        <div className="px-8 pt-4">
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Write a brief description (shown in previews)..."
            rows={2}
            className="w-full text-lg text-gray-600 border-0 focus:ring-0 bg-transparent resize-none placeholder-gray-300 p-0"
          />
        </div>

        {/* Divider */}
        <div className="mx-8 my-4 border-t border-gray-100" />

        {/* Toolbar */}
        <EditorToolbar editor={editor} />

        {/* Editor Content */}
        <div className="border-t border-gray-100">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Post Settings */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Post Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border-gray-300 text-sm focus:border-orange-500 focus:ring-orange-500"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Visibility
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full rounded-lg border-gray-300 text-sm focus:border-orange-500 focus:ring-orange-500"
            >
              {visibilities.map((vis) => (
                <option key={vis.value} value={vis.value}>
                  {vis.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="mt-4 text-center text-sm text-gray-500">
        <span className="font-medium">Keyboard shortcuts:</span>{' '}
        <code className="bg-gray-100 px-1 rounded">Ctrl+B</code> Bold,{' '}
        <code className="bg-gray-100 px-1 rounded">Ctrl+I</code> Italic,{' '}
        <code className="bg-gray-100 px-1 rounded">Ctrl+U</code> Underline,{' '}
        <code className="bg-gray-100 px-1 rounded">```</code> Code Block
      </div>
    </div>
  )
}
