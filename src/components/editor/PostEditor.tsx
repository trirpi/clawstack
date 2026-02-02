'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { Button } from '@/components/ui/Button'
import { slugify } from '@/lib/utils'

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

export function PostEditor({ publicationId, initialData }: PostEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialData?.title || '')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '')
  const [category, setCategory] = useState(initialData?.category || 'ARTICLE')
  const [visibility, setVisibility] = useState(initialData?.visibility || 'FREE')
  const [saving, setSaving] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: initialData?.content || '<p>Start writing your post...</p>',
    editorProps: {
      attributes: {
        class:
          'prose prose-lg max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
  })

  const handleSave = async (publish: boolean) => {
    if (!title.trim()) {
      alert('Please add a title')
      return
    }

    setSaving(true)

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

      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      console.error('Error saving post:', error)
      alert('Failed to save post')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title..."
          className="w-full text-3xl font-bold border-0 border-b-2 border-gray-200 focus:border-orange-500 focus:ring-0 bg-transparent pb-2"
        />
      </div>

      {/* Excerpt */}
      <div>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Write a brief excerpt or description..."
          rows={2}
          className="w-full text-gray-600 border-0 border-b border-gray-200 focus:border-orange-500 focus:ring-0 bg-transparent resize-none"
        />
      </div>

      {/* Settings Row */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border-gray-300 text-sm focus:border-orange-500 focus:ring-orange-500"
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
            className="rounded-lg border-gray-300 text-sm focus:border-orange-500 focus:ring-orange-500"
          >
            {visibilities.map((vis) => (
              <option key={vis.value} value={vis.value}>
                {vis.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor?.isActive('bold') ? 'bg-gray-200' : ''
          }`}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor?.isActive('italic') ? 'bg-gray-200' : ''
          }`}
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-gray-200 font-mono text-sm ${
            editor?.isActive('codeBlock') ? 'bg-gray-200' : ''
          }`}
          title="Code Block"
        >
          {'</>'}
        </button>
        <button
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`p-2 rounded hover:bg-gray-200 ${
            editor?.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''
          }`}
          title="Heading"
        >
          H2
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor?.isActive('bulletList') ? 'bg-gray-200' : ''
          }`}
          title="Bullet List"
        >
          •
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor?.isActive('orderedList') ? 'bg-gray-200' : ''
          }`}
          title="Numbered List"
        >
          1.
        </button>
      </div>

      {/* Editor */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <EditorContent editor={editor} />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={() => handleSave(false)}
          disabled={saving}
        >
          Save Draft
        </Button>
        <Button onClick={() => handleSave(true)} disabled={saving}>
          {saving ? 'Publishing...' : 'Publish'}
        </Button>
      </div>
    </div>
  )
}
