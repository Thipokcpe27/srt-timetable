export default function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="backdrop-blur-md bg-white/80 rounded-xl border border-white/40 overflow-hidden animate-pulse"
          aria-hidden="true"
        >
          {/* Header Skeleton */}
          <div className="backdrop-blur-sm bg-gray-50/80 border-b border-gray-200/50 px-4 md:px-6 py-3 md:py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3">
              <div className="flex-1 w-full sm:w-auto space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-20 h-6 bg-gray-200/70 rounded-full"></div>
                  <div className="w-16 h-6 bg-gray-200/70 rounded-md"></div>
                </div>
                <div className="w-48 h-7 bg-gray-200/70 rounded-md"></div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200/70 rounded-full"></div>
                  <div className="w-32 h-5 bg-gray-200/70 rounded-md"></div>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
                <div className="w-24 h-8 bg-gray-200/70 rounded-lg"></div>
                <div className="w-16 h-5 bg-gray-200/70 rounded-md"></div>
              </div>
            </div>
          </div>

          {/* Body Skeleton */}
          <div className="p-4 md:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-32 h-5 bg-gray-200/70 rounded-md"></div>
              <div className="w-24 h-5 bg-gray-200/70 rounded-md"></div>
            </div>
            <div className="w-full h-px bg-gray-200/70"></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="w-full h-5 bg-gray-200/70 rounded-md"></div>
              <div className="w-full h-5 bg-gray-200/70 rounded-md"></div>
            </div>
          </div>

          {/* Footer Skeleton */}
          <div className="border-t border-gray-200/50 flex">
            <div className="flex-1 border-r border-gray-200/50 p-3">
              <div className="w-32 h-5 bg-gray-200/70 rounded-md mx-auto"></div>
            </div>
            <div className="flex-1 p-3">
              <div className="w-28 h-5 bg-gray-200/70 rounded-md mx-auto"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
