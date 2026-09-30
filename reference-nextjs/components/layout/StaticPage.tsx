import Link from 'next/link'
import type { PageSection } from '@/lib/pages-data'

interface StaticPageProps {
  title: string
  subtitle?: string
  sections?: PageSection[]
  children?: React.ReactNode
}

export default function StaticPage({ title, subtitle, sections, children }: StaticPageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200 py-3">
        <div className="max-w-[1280px] mx-auto px-6">
          <nav className="text-sm text-gray-500 flex items-center gap-2">
            <Link href="/" className="hover:text-[#800000] transition-colors">Home</Link>
            <span>›</span>
            <span className="text-gray-800 font-medium">{title}</span>
          </nav>
        </div>
      </div>

      {/* Page Hero Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #5C0000 0%, #800000 50%, #a00000 100%)",
          padding: "56px 0 52px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div style={{
          position: "absolute", top: -40, right: -40,
          width: 200, height: 200, borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.05)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -60, left: -30,
          width: 260, height: 260, borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.04)", pointerEvents: "none",
        }} />

        <div className="max-w-[1280px] mx-auto px-6 text-center" style={{ position: "relative", zIndex: 1 }}>
          <h1
            style={{
              fontSize: "clamp(26px, 5vw, 40px)",
              fontWeight: 800,
              color: "#ffffff",
              marginBottom: 12,
              fontFamily: "'Open Sans', sans-serif",
              letterSpacing: "-0.3px",
              textShadow: "0 2px 8px rgba(0,0,0,0.35)",
              lineHeight: 1.25,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: 16,
                color: "rgba(255,255,255,0.88)",
                fontFamily: "'Open Sans', sans-serif",
                fontWeight: 400,
                maxWidth: 520,
                margin: "0 auto",
                lineHeight: 1.6,
                textShadow: "0 1px 4px rgba(0,0,0,0.25)",
              }}
            >
              {subtitle}
            </p>
          )}
          {/* Decorative underline */}
          <div style={{
            width: 52, height: 3,
            backgroundColor: "rgba(255,255,255,0.55)",
            borderRadius: 99,
            margin: "18px auto 0",
          }} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1280px] mx-auto px-6 py-14">
        <div className="max-w-4xl mx-auto">
          {children ? children : (
            sections && sections.length > 0 && (
              <div className="space-y-10">
                {sections.map(section =>
                  section.content ? (
                    <div
                      key={section.id}
                      className="prose prose-lg max-w-none
                        prose-headings:text-gray-800 prose-headings:font-bold
                        prose-h2:text-2xl prose-h2:border-b prose-h2:border-[#e6b3b3]
                        prose-h2:pb-2 prose-h2:mb-6
                        prose-p:text-gray-600 prose-p:leading-relaxed
                        prose-strong:text-gray-800"
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  ) : null
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
