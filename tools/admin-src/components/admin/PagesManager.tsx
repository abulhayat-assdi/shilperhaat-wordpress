'use client'

import { useState, useRef, useEffect } from 'react'
import { PanelLeftOpen, X } from 'lucide-react'
import { PageContent, PageSection } from '@/lib/pages-data'
import AdminLayout from '@/components/admin/AdminLayout'

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export default function AdminPagesManager() {
  const [pages, setPages] = useState<PageContent[]>([])
  const [selectedPage, setSelectedPage] = useState<PageContent | null>(null)
  const [editMode, setEditMode] = useState<'richtext' | 'html'>('richtext')
  const [saveMsg, setSaveMsg] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  // Mobile-only drawer for the page list (hidden column on small screens)
  const [listOpen, setListOpen] = useState(false)

  useEffect(() => {
    fetch('/api/admin/pages')
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
        setPages(data.pages || [])
        setLoadError(null)
      })
      .catch((err: Error) => setLoadError(err.message || 'Failed to load pages.'))
      .finally(() => setLoading(false))
  }, [])

  const handleEdit = (page: PageContent) => {
    setSelectedPage({ ...page, sections: page.sections.map(s => ({ ...s })) })
    setSaveMsg('')
    setDeleteConfirm(null)
    setListOpen(false)
  }

  const handleSave = async () => {
    if (!selectedPage || saving) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/pages/${selectedPage.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedPage.title,
          subtitle: selectedPage.subtitle,
          sections: selectedPage.sections,
          metaTitle: selectedPage.metaTitle,
          metaDescription: selectedPage.metaDescription,
          isPublished: selectedPage.isPublished,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSaveMsg(data.error || 'Failed to save.')
      } else {
        setPages(prev => prev.map(p => (p.slug === data.page.slug ? data.page : p)))
        setSaveMsg('Saved successfully!')
      }
    } catch {
      setSaveMsg('Failed to save.')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMsg(''), 3000)
    }
  }

  const updateSection = (id: string, updates: Partial<PageSection>) => {
    if (!selectedPage) return
    setSelectedPage({
      ...selectedPage,
      sections: selectedPage.sections.map(s => s.id === id ? { ...s, ...updates } : s)
    })
  }

  const addSection = () => {
    if (!selectedPage) return
    const newSec: PageSection = {
      id: genId(),
      title: 'Additional Content',
      content: '',
      order: selectedPage.sections.length + 1,
    }
    setSelectedPage({ ...selectedPage, sections: [...selectedPage.sections, newSec] })
    setTimeout(() => {
      document.getElementById('add-section-btn')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 80)
  }

  const deleteSection = (id: string) => {
    if (!selectedPage) return
    setSelectedPage({
      ...selectedPage,
      sections: selectedPage.sections
        .filter(s => s.id !== id)
        .map((s, i) => ({ ...s, order: i + 1 })),
    })
    setDeleteConfirm(null)
  }

  const pageListBody = (
    <>
      {loadError && (
        <div className="m-3 p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-xs font-semibold text-red-600 mb-1">Could not load pages</p>
          <p className="text-xs text-red-500 break-words">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-xs font-semibold text-white px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: '#800000' }}
          >
            Retry
          </button>
        </div>
      )}
      {pages.map(page => (
        <button
          key={page.slug}
          onClick={() => handleEdit(page)}
          className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-[#FFF0F0] transition-colors ${
            selectedPage?.slug === page.slug ? 'bg-[#FFF0F0] border-l-4 border-l-[#800000]' : ''
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{page.title}</p>
              <p className="text-xs text-gray-400">/{page.slug}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
              page.isPublished ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {page.isPublished ? 'Live' : 'Draft'}
            </span>
          </div>
        </button>
      ))}
    </>
  )

  return (
    <AdminLayout title="Pages Manager">
      <div className="flex h-[calc(100vh-112px)] -m-4 md:-m-6 bg-gray-50">

        {/* LEFT: Pages List — fixed column on desktop, hidden on mobile */}
        <div className="hidden md:block w-64 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
          <div className="p-4 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">All Pages</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {loading ? 'Loading…' : `${pages.length} pages total`}
            </p>
          </div>
          {pageListBody}
        </div>

        {/* Mobile: Pages List drawer */}
        {listOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setListOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white flex flex-col md:hidden shadow-xl">
              <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">All Pages</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {loading ? 'Loading…' : `${pages.length} pages total`}
                  </p>
                </div>
                <button onClick={() => setListOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100" aria-label="Close page list">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">{pageListBody}</div>
            </div>
          </>
        )}

        {/* RIGHT: Editor */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Mobile: open the page list */}
          <button
            onClick={() => setListOpen(true)}
            className="md:hidden mb-4 flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 shadow-sm"
          >
            <PanelLeftOpen size={16} className="text-[#800000]" />
            All Pages {loading ? '' : `(${pages.length})`}
          </button>
          {selectedPage ? (
            <div className="max-w-4xl mx-auto">

              {/* Page Settings */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h2 className="text-base font-bold text-gray-800 mb-4">Page Settings</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Page Title</label>
                    <input
                      type="text"
                      value={selectedPage.title}
                      onChange={e => setSelectedPage({ ...selectedPage, title: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#800000]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={selectedPage.subtitle}
                      onChange={e => setSelectedPage({ ...selectedPage, subtitle: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#800000]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Meta Title (SEO)</label>
                    <input
                      type="text"
                      value={selectedPage.metaTitle}
                      onChange={e => setSelectedPage({ ...selectedPage, metaTitle: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#800000]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Meta Description (SEO)</label>
                    <input
                      type="text"
                      value={selectedPage.metaDescription}
                      onChange={e => setSelectedPage({ ...selectedPage, metaDescription: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#800000]"
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <label className="text-xs font-semibold text-gray-600">Status:</label>
                  <button
                    onClick={() => setSelectedPage({ ...selectedPage, isPublished: !selectedPage.isPublished })}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      selectedPage.isPublished
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {selectedPage.isPublished ? '✓ Published' : 'Draft'}
                  </button>
                  <a
                    href={`/${selectedPage.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#800000] hover:underline"
                  >
                    View Page →
                  </a>
                </div>
              </div>

              {/* Editor Mode Toggle */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-medium text-gray-700">Editor Mode:</span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {(['richtext', 'html'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setEditMode(mode)}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        editMode === mode ? 'bg-white shadow text-[#800000]' : 'text-gray-500'
                      }`}
                    >
                      {mode === 'richtext' ? 'Rich Text' : 'HTML'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Sections */}
              {selectedPage.sections.map((section, idx) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  index={idx}
                  editMode={editMode}
                  canDelete={selectedPage.sections.length > 1}
                  isConfirmingDelete={deleteConfirm === section.id}
                  onTitleChange={t => updateSection(section.id, { title: t })}
                  onContentChange={c => updateSection(section.id, { content: c })}
                  onDeleteClick={() => setDeleteConfirm(section.id)}
                  onDeleteConfirm={() => deleteSection(section.id)}
                  onDeleteCancel={() => setDeleteConfirm(null)}
                />
              ))}

              {/* Add New Section */}
              <button
                id="add-section-btn"
                onClick={addSection}
                className="w-full py-4 mb-6 border-2 border-dashed border-[#800000] rounded-xl text-[#800000] font-semibold text-sm text-center cursor-pointer hover:bg-[#FFF0F0] transition-colors"
              >
                + Add New Section
              </button>

              {/* Save */}
              <div className="flex items-center gap-4 pb-6">
                <button
                  onClick={handleSave}
                  className="bg-[#800000] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#5C0000] transition-colors shadow-sm"
                >
                  Save & Publish
                </button>
                {saveMsg && (
                  <span className="text-green-600 font-medium text-sm bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                    ✅ {saveMsg}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-lg font-medium">Select a page to edit</p>
              <p className="text-sm mt-1">Choose from the list on the left</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

function SectionCard({
  section,
  index,
  editMode,
  canDelete,
  isConfirmingDelete,
  onTitleChange,
  onContentChange,
  onDeleteClick,
  onDeleteConfirm,
  onDeleteCancel,
}: {
  section: PageSection
  index: number
  editMode: 'richtext' | 'html'
  canDelete: boolean
  isConfirmingDelete: boolean
  onTitleChange: (t: string) => void
  onContentChange: (c: string) => void
  onDeleteClick: () => void
  onDeleteConfirm: () => void
  onDeleteCancel: () => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)

  return (
    <div className="border border-gray-200 rounded-xl mb-4 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-200">
        <button
          onClick={() => setCollapsed(c => !c)}
          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex-shrink-0">
          Section {index + 1} —
        </span>

        {editingTitle ? (
          <input
            autoFocus
            value={section.title}
            onChange={e => onTitleChange(e.target.value)}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={e => { if (e.key === 'Enter') setEditingTitle(false) }}
            className="flex-1 text-sm font-semibold text-gray-700 border border-gray-300 rounded px-2 py-0.5 focus:outline-none focus:border-[#800000]"
          />
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            className="flex-1 text-sm font-semibold text-gray-700 hover:text-[#800000] text-left truncate"
            title="Click to rename"
          >
            {section.title}
          </button>
        )}

        {canDelete && (
          <button
            onClick={onDeleteClick}
            className="flex-shrink-0 ml-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded p-1.5 transition-colors"
            title="Delete section"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        )}
      </div>

      {/* Delete confirmation */}
      {isConfirmingDelete && (
        <div className="px-5 py-3 bg-red-50 border-b border-red-100 flex items-center gap-3">
          <span className="text-sm text-red-700 font-medium">Delete this section?</span>
          <button
            onClick={onDeleteConfirm}
            className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded hover:bg-red-600"
          >
            Yes, Delete
          </button>
          <button
            onClick={onDeleteCancel}
            className="px-3 py-1 bg-white text-gray-600 text-xs font-semibold rounded border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Body */}
      {!collapsed && (
        <div className="p-5">
          <SectionContentEditor
            key={section.id + editMode}
            value={section.content}
            onChange={onContentChange}
            editMode={editMode}
          />
        </div>
      )}
    </div>
  )
}

const TOOLBAR_BUTTONS = [
  { label: 'B', cmd: 'bold', val: undefined, style: 'font-bold' },
  { label: 'I', cmd: 'italic', val: undefined, style: 'italic' },
  { label: 'U', cmd: 'underline', val: undefined, style: 'underline' },
  { label: 'H2', cmd: 'formatBlock', val: 'h2', style: '' },
  { label: 'H3', cmd: 'formatBlock', val: 'h3', style: '' },
  { label: '• List', cmd: 'insertUnorderedList', val: undefined, style: '' },
  { label: '1. List', cmd: 'insertOrderedList', val: undefined, style: '' },
] as const

function SectionContentEditor({
  value,
  onChange,
  editMode,
}: {
  value: string
  onChange: (v: string) => void
  editMode: 'richtext' | 'html'
}) {
  const editorRef = useRef<HTMLDivElement>(null)
  const pendingChange = useRef(false)

  useEffect(() => {
    if (pendingChange.current) {
      pendingChange.current = false
      return
    }
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    pendingChange.current = true
    onChange((e.currentTarget as HTMLElement).innerHTML)
  }

  return (
    <div>
      {editMode === 'html' ? (
        <textarea
          dir="ltr"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#800000] resize-y text-left"
          style={{ minHeight: '300px', direction: 'ltr' }}
          placeholder="<h2>Section Title</h2><p>Your content here...</p>"
        />
      ) : (
        <div>
          <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border border-gray-200 rounded-t-lg">
            {TOOLBAR_BUTTONS.map(btn => (
              <button
                key={btn.cmd + btn.label}
                onMouseDown={e => {
                  e.preventDefault()
                  document.execCommand(btn.cmd, false, btn.val)
                }}
                className={`px-2 py-1 text-xs border border-gray-300 rounded hover:bg-[#FFF0F0] hover:border-[#800000] ${btn.style}`}
              >
                {btn.label}
              </button>
            ))}
          </div>
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            dir="ltr"
            onInput={handleInput}
            className="w-full border border-gray-300 border-t-0 rounded-b-lg px-4 py-3 text-sm focus:outline-none prose max-w-none text-left"
            style={{ minHeight: '260px', direction: 'ltr' }}
          />
        </div>
      )}

      {value && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Preview</p>
          <div
            className="prose prose-sm max-w-none text-gray-600 bg-gray-50 rounded-lg p-4"
            dangerouslySetInnerHTML={{ __html: value }}
          />
        </div>
      )}
    </div>
  )
}
