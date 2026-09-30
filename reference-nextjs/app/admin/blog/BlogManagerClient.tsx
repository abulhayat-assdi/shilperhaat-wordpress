'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { PanelLeftOpen, X } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import RichTextEditor from '@/components/admin/RichTextEditor'
import {
  BlogPost,
  generateSlug,
  estimateReadTime,
} from '@/lib/blog-data'

function formatDateShort(iso: string): string {
  const d = new Date(iso)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

function emptyPost(): BlogPost {
  return {
    id: '',
    slug: '',
    title: '',
    excerpt: '',
    content: '',
    coverImage: '',
    author: 'শিল্পেরহাট টিম',
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: '',
    tags: [],
    isPublished: false,
    readTime: 1,
  }
}

export default function BlogManagerClient() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [selected, setSelected] = useState<BlogPost | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [tagsInput, setTagsInput] = useState('')
  const [mounted, setMounted] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  // Mobile-only drawer for the post list (hidden column on small screens)
  const [listOpen, setListOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/blog')
      .then(res => res.json())
      .then(data => setPosts(data.posts || []))
      .catch(() => setSaveMsg({ type: 'error', text: 'Failed to load posts.' }))
      .finally(() => setMounted(true))
  }, [])

  const showMsg = (type: 'success' | 'error', text: string) => {
    setSaveMsg({ type, text })
    setTimeout(() => setSaveMsg(null), 3500)
  }

  const handleSelect = (post: BlogPost) => {
    setSelected({ ...post, tags: [...post.tags] })
    setTagsInput(post.tags.join(', '))
    setIsNew(false)
    setDeleteConfirm(false)
    setSaveMsg(null)
    setListOpen(false)
  }

  const handleNewPost = () => {
    const blank = emptyPost()
    setSelected(blank)
    setTagsInput('')
    setIsNew(true)
    setDeleteConfirm(false)
    setSaveMsg(null)
    setListOpen(false)
  }

  const handleTitleChange = useCallback((title: string) => {
    if (!selected) return
    setSelected(prev => {
      if (!prev) return prev
      return {
        ...prev,
        title,
        slug: isNew ? generateSlug(title) : prev.slug,
      }
    })
  }, [selected, isNew])

  const handleContentChange = useCallback((html: string) => {
    setSelected(prev => {
      if (!prev) return prev
      return {
        ...prev,
        content: html,
        readTime: estimateReadTime(html),
      }
    })
  }, [])

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selected) return
    setIsUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'blog')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const data = await res.json()
        setSelected(prev => prev ? { ...prev, coverImage: data.url } : prev)
      } else {
        showMsg('error', 'Upload failed. Please try again.')
      }
    } catch {
      showMsg('error', 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSave = async () => {
    if (!selected) return
    if (!selected.title.trim()) {
      showMsg('error', 'Title is required.')
      return
    }

    const tagsArray = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)

    const payload = {
      title: selected.title,
      slug: selected.slug || generateSlug(selected.title),
      excerpt: selected.excerpt,
      content: selected.content,
      coverImage: selected.coverImage,
      author: selected.author,
      category: selected.category,
      tags: tagsArray,
      isPublished: selected.isPublished,
      readTime: selected.readTime,
    }

    try {
      const res = await fetch(
        isNew ? '/api/admin/blog' : `/api/admin/blog/${selected.id}`,
        {
          method: isNew ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )
      const data = await res.json()
      if (!res.ok) {
        showMsg('error', data.error || 'Failed to save post.')
        return
      }
      if (isNew) {
        setPosts([data.post, ...posts])
      } else {
        setPosts(posts.map(p => (p.id === data.post.id ? data.post : p)))
      }
      setSelected(data.post)
      setTagsInput(data.post.tags.join(', '))
      setIsNew(false)
      showMsg('success', 'Post saved successfully!')
    } catch {
      showMsg('error', 'Failed to save post.')
    }
  }

  const handleDelete = async () => {
    if (!selected) return
    if (isNew || !selected.id) {
      setSelected(null)
      setDeleteConfirm(false)
      return
    }
    try {
      const res = await fetch(`/api/admin/blog/${selected.id}`, { method: 'DELETE' })
      if (!res.ok) {
        showMsg('error', 'Failed to delete post.')
        return
      }
      setPosts(posts.filter(p => p.id !== selected.id))
      setSelected(null)
      setDeleteConfirm(false)
      setSaveMsg(null)
    } catch {
      showMsg('error', 'Failed to delete post.')
    }
  }

  if (!mounted) {
    return (
      <AdminLayout title="Blog Manager">
        <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>
      </AdminLayout>
    )
  }

  const postListBody = (
    <>
      {/* Header + New Post */}
      <div className="p-4 border-b border-gray-100 flex-shrink-0">
        <button
          onClick={handleNewPost}
          className="w-full py-2.5 rounded-lg text-white text-sm font-semibold transition-colors"
          style={{ backgroundColor: '#800000' }}
        >
          + New Post
        </button>
        <p className="text-xs text-gray-400 mt-2">{posts.length} posts total</p>
      </div>

      {/* Post List */}
      <div className="flex-1 overflow-y-auto">
        {posts.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-sm">
            No posts yet. Create your first post!
          </div>
        ) : (
          posts.map(post => (
            <button
              key={post.id}
              onClick={() => handleSelect(post)}
              className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-[#FFF0F0] transition-colors ${
                selected?.id === post.id
                  ? 'bg-[#FFF0F0] border-l-4 border-l-[#800000]'
                  : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate leading-tight">
                    {post.title || '(Untitled)'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{post.category || 'No category'}</p>
                  <p className="text-xs text-gray-300 mt-0.5">{formatDateShort(post.publishedAt)}</p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${
                    post.isPublished
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {post.isPublished ? 'Live' : 'Draft'}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </>
  )

  return (
    <AdminLayout title="Blog Manager">
      <div className="flex h-[calc(100vh-112px)] -m-4 md:-m-6 bg-gray-50">

        {/* LEFT: Post List — fixed column on desktop, hidden on mobile */}
        <div className="hidden md:flex w-72 bg-white border-r border-gray-200 flex-col flex-shrink-0 overflow-hidden">
          {postListBody}
        </div>

        {/* Mobile: Post List drawer */}
        {listOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setListOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white flex flex-col md:hidden shadow-xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">All Posts</p>
                <button onClick={() => setListOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100" aria-label="Close post list">
                  <X size={18} />
                </button>
              </div>
              {postListBody}
            </div>
          </>
        )}

        {/* RIGHT: Editor */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Mobile: open the post list */}
          <button
            onClick={() => setListOpen(true)}
            className="md:hidden mb-4 flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 shadow-sm"
          >
            <PanelLeftOpen size={16} className="text-[#800000]" />
            All Posts ({posts.length})
          </button>
          {selected ? (
            <div className="max-w-4xl mx-auto">

              {/* Card 1: Title + Status */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Post Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={selected.title}
                      onChange={e => handleTitleChange(e.target.value)}
                      placeholder="Post title..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base font-semibold focus:outline-none focus:border-[#800000] transition-colors"
                    />
                  </div>
                  <div className="flex-shrink-0 pt-6">
                    <button
                      onClick={() => setSelected({ ...selected, isPublished: !selected.isPublished })}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                        selected.isPublished
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {selected.isPublished ? '✓ Published' : 'Draft'}
                    </button>
                  </div>
                </div>

                {/* Slug */}
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Slug (URL)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">/blog/</span>
                    <input
                      type="text"
                      value={selected.slug}
                      readOnly
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 bg-gray-50 focus:outline-none font-mono"
                      placeholder="auto-generated from title"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Category + Author */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category</label>
                    <input
                      type="text"
                      value={selected.category}
                      onChange={e => setSelected({ ...selected, category: e.target.value })}
                      placeholder="e.g. Heritage, Care Guide"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#800000] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Author</label>
                    <input
                      type="text"
                      value={selected.author}
                      onChange={e => setSelected({ ...selected, author: e.target.value })}
                      placeholder="Author name"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#800000] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: Excerpt */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Excerpt</label>
                <textarea
                  rows={3}
                  value={selected.excerpt}
                  onChange={e => setSelected({ ...selected, excerpt: e.target.value })}
                  placeholder="Short description shown on the blog listing..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#800000] transition-colors resize-none"
                />
              </div>

              {/* Card 4: Cover Image Upload */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
                <label className="block text-xs font-semibold text-gray-600 mb-3">Cover Image</label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleCoverUpload}
                />

                {selected.coverImage ? (
                  <div>
                    <div
                      className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 cursor-pointer group"
                      style={{ aspectRatio: '16/9' }}
                      onClick={() => !isUploading && fileInputRef.current?.click()}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selected.coverImage}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <span className="text-white text-sm font-semibold">Change Image</span>
                      </div>
                      {isUploading && (
                        <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-2">
                          <div
                            className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
                            style={{ borderColor: '#800000', borderTopColor: 'transparent' }}
                          />
                          <span className="text-sm text-gray-600 font-medium">Uploading...</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        type="button"
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        Change Image
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelected({ ...selected, coverImage: '' })}
                        disabled={isUploading}
                        className="px-4 py-2 text-xs font-semibold rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        Remove
                      </button>
                      <span className="text-xs text-gray-400 truncate flex-1">{selected.coverImage}</span>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full rounded-xl border-2 border-dashed border-gray-300 hover:border-[#800000] hover:bg-[#FFF0F0] transition-all duration-200 flex flex-col items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ minHeight: 180 }}
                  >
                    {isUploading ? (
                      <>
                        <div
                          className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
                          style={{ borderColor: '#800000', borderTopColor: 'transparent' }}
                        />
                        <span className="text-sm text-gray-500 font-medium">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-full bg-[#FFF0F0] flex items-center justify-center">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#800000" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-gray-700">Click to upload cover image</p>
                          <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — max 15MB</p>
                          <p className="text-xs text-gray-400">Recommended: 1200×675px (16:9)</p>
                        </div>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Card 5: Tags + Read Time */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Tags <span className="text-gray-400 font-normal">(comma separated)</span>
                    </label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={e => setTagsInput(e.target.value)}
                      placeholder="textile, heritage, handcraft"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#800000] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Read Time <span className="text-gray-400 font-normal">(minutes)</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={selected.readTime}
                      onChange={e => setSelected({ ...selected, readTime: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#800000] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Card 6: Content Editor */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
                <label className="block text-xs font-semibold text-gray-600 mb-3">Content</label>
                <RichTextEditor
                  key={selected.id}
                  value={selected.content}
                  onChange={handleContentChange}
                  placeholder="Write your blog post content here..."
                />
              </div>

              {/* Save + Delete Row */}
              <div className="flex items-center justify-between gap-4 pb-8">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleSave}
                    className="px-8 py-3 rounded-lg text-white font-semibold text-sm transition-colors shadow-sm"
                    style={{ backgroundColor: '#800000' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#a86e08' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#800000' }}
                  >
                    Save & Publish
                  </button>
                  {saveMsg && (
                    <span
                      className={`text-sm font-medium px-4 py-2 rounded-lg border ${
                        saveMsg.type === 'success'
                          ? 'text-green-600 bg-green-50 border-green-200'
                          : 'text-red-600 bg-red-50 border-red-200'
                      }`}
                    >
                      {saveMsg.type === 'success' ? '✅' : '❌'} {saveMsg.text}
                    </span>
                  )}
                </div>

                {!isNew && (
                  <div className="flex items-center gap-2">
                    {deleteConfirm ? (
                      <>
                        <span className="text-sm text-red-600 font-medium">Delete this post?</span>
                        <button
                          onClick={handleDelete}
                          className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Yes, Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(false)}
                          className="px-3 py-1.5 bg-white text-gray-600 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(true)}
                        className="px-4 py-2 rounded-lg text-red-500 border border-red-200 text-sm font-medium hover:bg-red-50 transition-colors"
                      >
                        Delete Post
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="text-6xl mb-4">✍️</div>
              <p className="text-lg font-medium text-gray-600">Select a post to edit</p>
              <p className="text-sm mt-1">Or create a new post using the button on the left</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
