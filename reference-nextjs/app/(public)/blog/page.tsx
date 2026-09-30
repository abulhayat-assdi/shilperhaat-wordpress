'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BlogPost } from '@/lib/blog-data'

function formatDate(iso: string): string {
  const d = new Date(iso)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

function AuthorAvatar({ name }: { name: string }) {
  const initial = name.charAt(0)
  return (
    <span
      className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white font-bold text-xs flex-shrink-0"
      style={{ backgroundColor: '#800000' }}
    >
      {initial}
    </span>
  )
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      {/* Cover Image */}
      <div className="overflow-hidden" style={{ aspectRatio: '16/9' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-5">
        {/* Category badge */}
        <span
          className="self-start text-xs font-semibold px-3 py-1 rounded-full text-white mb-3"
          style={{ backgroundColor: '#800000' }}
        >
          {post.category}
        </span>

        {/* Title */}
        <h2
          className="font-bold text-gray-900 text-base leading-snug mb-2"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {post.title}
        </h2>

        {/* Excerpt */}
        <p
          className="text-gray-500 text-sm leading-relaxed mb-4 flex-1"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {post.excerpt}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <AuthorAvatar name={post.author} />
          <span className="text-xs text-gray-600 font-medium truncate flex-1">{post.author}</span>
          <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(post.publishedAt)}</span>
          <span className="text-xs text-gray-400 flex-shrink-0">· {post.readTime} min read</span>
        </div>
      </div>
    </Link>
  )
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    fetch('/api/blog')
      .then(res => res.json())
      .then(data => setPosts(data.posts || []))
      .catch(() => setPosts([]))
      .finally(() => setMounted(true))
  }, [])

  const categories = ['All', ...Array.from(new Set(posts.map(p => p.category)))]

  const filtered = activeCategory === 'All'
    ? posts
    : posts.filter(p => p.category === activeCategory)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div
        className="relative overflow-hidden py-16 px-4"
        style={{
          background: 'linear-gradient(135deg, #800000 0%, #5C0000 50%, #1a0808 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white -translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <p className="text-[#f5d0d0] text-sm font-semibold uppercase tracking-widest mb-3">
            শিল্পেরহাট ব্লগ
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            বাংলার হস্তশিল্পের গল্প
          </h1>
          <p className="text-[#fce8e8] text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            আমাদের কারিগরদের গল্প, টেক্সটাইলের ইতিহাস এবং হস্তশিল্পের যত্নের টিপস—সবই এখানে।
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Category Filter */}
        {mounted && categories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  activeCategory === cat
                    ? 'text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#800000] hover:text-[#800000]'
                }`}
                style={activeCategory === cat ? { backgroundColor: '#800000' } : {}}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {!mounted ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                <div className="bg-gray-200" style={{ aspectRatio: '16/9' }} />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-5 bg-gray-200 rounded w-full" />
                  <div className="h-5 bg-gray-200 rounded w-4/5" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-xl font-semibold text-gray-600">কোনো পোস্ট পাওয়া যায়নি</p>
            <p className="text-sm mt-2">এই ক্যাটাগরিতে এখনও কোনো পোস্ট প্রকাশিত হয়নি।</p>
            {activeCategory !== 'All' && (
              <button
                onClick={() => setActiveCategory('All')}
                className="mt-4 px-5 py-2 rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: '#800000' }}
              >
                সব পোস্ট দেখুন
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(post => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
