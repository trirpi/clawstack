'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react'
import type { Editor } from '@tiptap/react'

interface EditorToolbarProps {
  editor: Editor | null
}

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}

interface SelectionRange {
  from: number
  to: number
}

const CODE_LANGUAGES = [
  { value: 'plaintext', label: 'Plain text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'bash', label: 'Bash' },
  { value: 'json', label: 'JSON' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
]

function normalizeLinkUrl(url: string) {
  if (!url) return ''

  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(url)) {
    return url
  }

  if (url.startsWith('/') || url.startsWith('#') || url.startsWith('?')) {
    return url
  }

  return `https://${url}`
}

function normalizeImageUrl(url: string) {
  if (!url) return ''

  if (/^(https?:\/\/|\/|data:image\/)/i.test(url)) {
    return url
  }

  return `https://${url}`
}

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-orange-100 text-orange-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-gray-200 mx-1" />
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const [isLinkOpen, setIsLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [linkSelection, setLinkSelection] = useState<SelectionRange | null>(null)

  const [selectedCodeLanguage, setSelectedCodeLanguage] = useState('javascript')

  const [isImageOpen, setIsImageOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')
  const [imageError, setImageError] = useState('')
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl('')
      return
    }

    const objectUrl = URL.createObjectURL(imageFile)
    setImagePreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [imageFile])

  const closeLinkDialog = useCallback(() => {
    setIsLinkOpen(false)
    setLinkSelection(null)
  }, [])

  const openLinkDialog = useCallback(() => {
    if (!editor) return

    editor.chain().focus().extendMarkRange('link').run()

    const previousUrl = editor.getAttributes('link').href || ''
    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to, ' ')

    setLinkSelection({ from, to })
    setLinkUrl(previousUrl)
    setLinkText(selectedText || previousUrl || '')
    setIsLinkOpen(true)
  }, [editor])

  const removeLink = useCallback(() => {
    if (!editor) return

    const range = linkSelection ?? {
      from: editor.state.selection.from,
      to: editor.state.selection.to,
    }

    if (range.from === range.to) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().setTextSelection(range).unsetLink().run()
    }

    closeLinkDialog()
  }, [editor, linkSelection, closeLinkDialog])

  const applyLink = useCallback(() => {
    if (!editor) return

    const rawUrl = linkUrl.trim()

    if (!rawUrl) {
      removeLink()
      return
    }

    const normalizedUrl = normalizeLinkUrl(rawUrl)
    const range = linkSelection ?? {
      from: editor.state.selection.from,
      to: editor.state.selection.to,
    }

    const content = linkText.length > 0 ? linkText : normalizedUrl
    const linkEnd = range.from + content.length

    editor
      .chain()
      .focus()
      .insertContentAt(range, content)
      .setTextSelection({ from: range.from, to: linkEnd })
      .setLink({ href: normalizedUrl })
      .run()

    closeLinkDialog()
  }, [editor, linkSelection, linkText, linkUrl, removeLink, closeLinkDialog])

  const handleCodeLanguageChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      if (!editor) return

      const language = event.target.value
      setSelectedCodeLanguage(language)

      if (editor.isActive('codeBlock')) {
        editor.chain().focus().updateAttributes('codeBlock', { language }).run()
      }
    },
    [editor],
  )

  const openImageDialog = useCallback(() => {
    setImageUrl('')
    setImageFile(null)
    setImageError('')
    setIsImageOpen(true)
  }, [])

  const closeImageDialog = useCallback(() => {
    setIsImageOpen(false)
    setImageUrl('')
    setImageFile(null)
    setImageError('')
  }, [])

  const onImageFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null
    setImageFile(nextFile)
    setImageError('')
  }, [])

  const onImageDrop = useCallback((event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    const nextFile = event.dataTransfer.files?.[0] ?? null
    setImageFile(nextFile)
    setImageError('')
  }, [])

  const onImageDropOver = useCallback((event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
  }, [])

  const insertImageFromUrl = useCallback(() => {
    if (!editor) return

    const normalized = normalizeImageUrl(imageUrl.trim())

    if (!normalized) {
      setImageError('Add an image URL or upload a file.')
      return
    }

    editor.chain().focus().setImage({ src: normalized }).run()
    closeImageDialog()
  }, [editor, imageUrl, closeImageDialog])

  const uploadAndInsertImage = useCallback(async () => {
    if (!editor || !imageFile) return

    setImageError('')
    setIsUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append('file', imageFile)

      const response = await fetch('/api/uploads/image', {
        method: 'POST',
        body: formData,
      })

      const payload = (await response.json().catch(() => null)) as { url?: string; error?: string } | null

      if (!response.ok || !payload?.url) {
        throw new Error(payload?.error || 'Failed to upload image')
      }

      editor.chain().focus().setImage({ src: payload.url, alt: imageFile.name }).run()
      closeImageDialog()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload image'
      setImageError(message)
    } finally {
      setIsUploadingImage(false)
    }
  }, [editor, imageFile, closeImageDialog])

  if (!editor) {
    return null
  }

  const codeBlockLanguage = editor.getAttributes('codeBlock').language || selectedCodeLanguage

  return (
    <div className="flex flex-wrap items-center gap-1 px-4 py-2 bg-gray-50 border-b border-gray-100">
      {/* Text Style */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold (Ctrl+B)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
        </svg>
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic (Ctrl+I)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4m-2 0l-4 16m0 0h4" />
        </svg>
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        title="Underline (Ctrl+U)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8v4a5 5 0 0010 0V8M5 20h14" />
        </svg>
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title="Strikethrough"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 4v8M4 12h16" />
        </svg>
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        isActive={editor.isActive('highlight')}
        title="Highlight"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.243 4.515l-6.738 6.737-.707 2.121-1.04 1.041 2.828 2.829 1.04-1.041 2.122-.707 6.737-6.738-4.242-4.242zm6.364 3.536a1 1 0 010 1.414l-7.778 7.778-2.122.707-1.414 1.414a1 1 0 01-1.414 0l-4.243-4.243a1 1 0 010-1.414l1.414-1.414.707-2.121 7.778-7.778a1 1 0 011.414 0l5.658 5.657z"/>
        </svg>
      </ToolbarButton>

      <ToolbarDivider />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        <span className="font-bold text-sm">H1</span>
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        <span className="font-bold text-sm">H2</span>
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        <span className="font-bold text-sm">H3</span>
      </ToolbarButton>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          <circle cx="2" cy="6" r="1" fill="currentColor" />
          <circle cx="2" cy="12" r="1" fill="currentColor" />
          <circle cx="2" cy="18" r="1" fill="currentColor" />
        </svg>
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Numbered List"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 6h13M7 12h13M7 18h13" />
          <text x="2" y="8" fontSize="8" fill="currentColor">1</text>
          <text x="2" y="14" fontSize="8" fill="currentColor">2</text>
          <text x="2" y="20" fontSize="8" fill="currentColor">3</text>
        </svg>
      </ToolbarButton>

      <ToolbarDivider />

      {/* Blocks */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="Quote"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
        </svg>
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock({ language: codeBlockLanguage }).run()}
        isActive={editor.isActive('codeBlock')}
        title="Code Block"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </ToolbarButton>

      {editor.isActive('codeBlock') && (
        <select
          value={codeBlockLanguage}
          onChange={handleCodeLanguageChange}
          className="h-9 rounded-lg border border-gray-300 bg-white px-2 text-sm text-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
          title="Code language"
        >
          {CODE_LANGUAGES.map((language) => (
            <option key={language.value} value={language.value}>
              {language.label}
            </option>
          ))}
        </select>
      )}

      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16" />
        </svg>
      </ToolbarButton>

      <ToolbarDivider />

      {/* Links & Media */}
      <ToolbarButton
        onClick={openLinkDialog}
        isActive={editor.isActive('link')}
        title="Add Link"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </ToolbarButton>

      <ToolbarButton
        onClick={openImageDialog}
        title="Add Image"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </ToolbarButton>

      <ToolbarDivider />

      {/* Text Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        isActive={editor.isActive({ textAlign: 'left' })}
        title="Align Left"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h14" />
        </svg>
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        isActive={editor.isActive({ textAlign: 'center' })}
        title="Align Center"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M5 18h14" />
        </svg>
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        isActive={editor.isActive({ textAlign: 'right' })}
        title="Align Right"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M6 18h14" />
        </svg>
      </ToolbarButton>

      <ToolbarDivider />

      {/* Undo/Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo (Ctrl+Z)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo (Ctrl+Shift+Z)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
        </svg>
      </ToolbarButton>

      {isLinkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900">Edit link</h4>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">Text</label>
                <input
                  autoFocus
                  type="text"
                  value={linkText}
                  onChange={(event) => setLinkText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') applyLink()
                    if (event.key === 'Escape') closeLinkDialog()
                  }}
                  placeholder="Link text"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(event) => setLinkUrl(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') applyLink()
                    if (event.key === 'Escape') closeLinkDialog()
                  }}
                  placeholder="https://example.com"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <p className="text-xs text-gray-500">
                URLs auto-link while typing and on paste. You can change display text without changing the URL.
              </p>
            </div>
            <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-between">
              <button
                type="button"
                onClick={removeLink}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Remove link
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeLinkDialog}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyLink}
                  className="px-3 py-1.5 text-sm rounded-lg bg-orange-600 text-white hover:bg-orange-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isImageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-xl bg-white shadow-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900">Insert image</h4>
            </div>

            <div className="px-5 py-4 space-y-4">
              <label
                onDrop={onImageDrop}
                onDragOver={onImageDropOver}
                className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center hover:border-orange-400 hover:bg-orange-50"
              >
                {imagePreviewUrl ? (
                  <img src={imagePreviewUrl} alt="Preview" className="max-h-28 rounded-lg" />
                ) : (
                  <>
                    <span className="text-sm font-medium text-gray-700">Drag and drop an image</span>
                    <span className="text-xs text-gray-500 mt-1">or click to browse</span>
                    <span className="text-xs text-gray-400 mt-2">PNG, JPG, WEBP, GIF, AVIF up to 10MB</span>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                  className="hidden"
                  onChange={onImageFileChange}
                />
              </label>

              {imageFile && (
                <div className="text-xs text-gray-600">Selected file: {imageFile.name}</div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">or paste image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                  placeholder="https://example.com/image.png"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {imageError && <p className="text-sm text-red-600">{imageError}</p>}
            </div>

            <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeImageDialog}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={isUploadingImage}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertImageFromUrl}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={isUploadingImage}
              >
                Use URL
              </button>
              <button
                type="button"
                onClick={uploadAndInsertImage}
                className="px-3 py-1.5 text-sm rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50"
                disabled={isUploadingImage || !imageFile}
              >
                {isUploadingImage ? 'Uploading...' : 'Upload image'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
