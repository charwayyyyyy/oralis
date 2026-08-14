export default function Loading() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-24 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-gold/20 border-t-gold animate-spin" />
        <span className="font-ui text-xs tracking-[0.25em] uppercase text-stone/50">
          Tuning the Atlas...
        </span>
      </div>
    </div>
  )
}
