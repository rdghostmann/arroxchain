const TransactionSkeleton = () => (
  <div className="p-4 rounded-xl border border-white/10 bg-gray-900/60 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
        <div className="h-3 bg-gray-700 rounded w-1/3"></div>
      </div>
    </div>
  </div>
);

export default TransactionSkeleton;