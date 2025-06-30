export default function CatalogLoading() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="h-8 w-48 bg-secondary rounded animate-pulse mb-8" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 bg-secondary rounded animate-pulse" />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card space-y-4">
            <div className="h-48 bg-secondary rounded animate-pulse" />
            <div className="h-6 w-2/3 bg-secondary rounded animate-pulse" />
            <div className="h-4 bg-secondary rounded animate-pulse" />
            <div className="h-8 bg-secondary rounded animate-pulse" />
          </div>
        ))}
      </div>
    </main>
  )
} 