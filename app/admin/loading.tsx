export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-stone-200 rounded-lg" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-28 bg-white border border-stone-200 rounded-2xl" />
        ))}
      </div>
      <div className="h-80 bg-white border border-stone-200 rounded-3xl" />
    </div>
  )
}
