// Renders a JSON-LD structured-data <script>. Search engines read these to
// build rich results (product cards, breadcrumbs, article rich snippets, the
// sitelinks search box, etc.). One component, reused everywhere.

export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // Content is built by us from trusted data, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
