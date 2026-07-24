// components/Pagination.jsx
'use client'

import { useMemo } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/16/solid'

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  totalItems,
  itemsPerPage
}) {
  const pages = useMemo(() => {
    const delta = 2
    const range = []
    const rangeWithDots = []
    let l
    
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i)
      }
    }
    
    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    })
    
    return rangeWithDots
  }, [currentPage, totalPages])
  
  if (totalPages <= 1) return null
  
  return (
    <div className="flex flex-col items-center gap-4 mt-8 pt-4 border-t border-white/10">
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-md px-2 py-1 text-sm text-gray-400 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeftIcon className="size-5" />
        </button>
        
        {pages.map((page, index) => (
          page === '...' ? (
            <span key={`dots-${index}`} className="px-2 text-gray-500">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-[2rem] rounded-md px-2 py-1 text-sm transition-colors ${
                currentPage === page
                  ? 'bg-indigo-500 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {page}
            </button>
          )
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded-md px-2 py-1 text-sm text-gray-400 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRightIcon className="size-5" />
        </button>
      </div>
      
      <div className="text-sm text-gray-400">
        Показано {((currentPage - 1) * itemsPerPage) + 1}-
        {Math.min(currentPage * itemsPerPage, totalItems)} из {totalItems} заказов
      </div>
    </div>
  )
}