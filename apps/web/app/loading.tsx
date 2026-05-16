export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0F1E]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-[3px] border-white/10 border-t-primary animate-spin" />
          <div className="absolute inset-0 h-12 w-12 rounded-full border-[3px] border-transparent border-b-accent/50 animate-spin" style={{ animationDuration: "1.5s", animationDirection: "reverse" }} />
        </div>
        <span className="text-sm font-medium text-white/30 animate-pulse">Chargement...</span>
      </div>
    </div>
  );
}
