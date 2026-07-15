export default function TicketSkeleton() {
  return (
    <div className="mt-6 animate-pulse">
      <div className="perforated-top h-4" />
      <div className="bg-ink/90 px-5 pt-4 pb-5">
        <div className="h-2 w-16 bg-paper/20 mb-4" />
        <div className="h-4 w-2/3 bg-paper/30 mb-2" />
        <div className="h-2 w-1/2 bg-paper/15 mb-5" />
        <div className="space-y-3">
          <div className="h-3 w-full bg-paper/15" />
          <div className="h-3 w-5/6 bg-paper/15" />
          <div className="h-3 w-4/6 bg-paper/15" />
        </div>
      </div>
    </div>
  );
}
