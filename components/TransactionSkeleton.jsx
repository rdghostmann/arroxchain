const TransactionSkeleton = () => (
  <div className="relative overflow-hidden p-4 rounded-xl border border-white/10 bg-gray-900/60 backdrop-blur-xl">
    
    {/* Shimmer Layer */}
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>

    {/* Content */}
    <div className="relative z-10 flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-800 rounded-lg" />
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-gray-800 rounded w-3/4" />
        <div className="h-3 bg-gray-800 rounded w-1/2" />
        <div className="h-3 bg-gray-800 rounded w-1/3" />
      </div>
    </div>
  </div>
);
export default TransactionSkeleton;