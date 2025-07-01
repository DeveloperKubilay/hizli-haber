import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {/* Önceki */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2.5 py-1.5 text-lg text-textPrimary hover:text-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Sayfa numaraları */}
        <div className="flex items-center gap-1">
          {/* İlk sayfa */}
          {currentPage > 3 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="w-9 h-9 text-sm rounded-full border transition-all bg-selectBox text-black border-selectBox hover:bg-secondary hover:border-secondary flex items-center justify-center"
              >
                1
              </button>
              {currentPage > 4 && (
                <span className="text-textPrimary px-1">-</span>
              )}
            </>
          )}

          {/* Ortadaki sayfalar */}
          {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 3) {
              pageNum = i + 1;
            } else if (currentPage <= 2) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 1) {
              pageNum = totalPages - 2 + i;
            } else {
              pageNum = currentPage - 1 + i;
            }
            
            if (pageNum <= 0 || pageNum > totalPages) return null;
            
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-9 h-9 text-sm rounded-full border transition-all flex items-center justify-center ${
                  currentPage === pageNum
                    ? 'bg-secondary text-black border-secondary font-semibold hover:bg-secondaryHover hover:text-black'
                    : 'bg-selectBox text-black border-selectBox hover:bg-secondary hover:border-secondary'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Son sayfa */}
          {currentPage < totalPages - 2 && totalPages > 3 && (
            <>
              {currentPage < totalPages - 3 && (
                <span className="text-textPrimary px-1">-</span>
              )}
              <button
                onClick={() => onPageChange(totalPages)}
                className="w-9 h-9 text-sm rounded-full border transition-all bg-selectBox text-black border-selectBox hover:bg-secondary hover:border-secondary flex items-center justify-center"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        {/* Sonraki */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2.5 py-1.5 text-lg text-textPrimary hover:text-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
