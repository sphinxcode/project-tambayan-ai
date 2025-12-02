'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const showPages = 5
    const halfShow = Math.floor(showPages / 2)

    let start = Math.max(1, currentPage - halfShow)
    let end = Math.min(totalPages, currentPage + halfShow)

    if (currentPage <= halfShow) {
      end = Math.min(totalPages, showPages)
    }
    if (currentPage > totalPages - halfShow) {
      start = Math.max(1, totalPages - showPages + 1)
    }

    if (start > 1) {
      pages.push(1)
      if (start > 2) pages.push('ellipsis')
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('ellipsis')
      pages.push(totalPages)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className={cn('flex items-center justify-center gap-1', className)}>
      {/* First Page */}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      >
        <ChevronsLeft className="h-4 w-4" />
        <span className="sr-only">First page</span>
      </Button>

      {/* Previous Page */}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) =>
          page === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="icon"
              className={cn(
                'h-8 w-8',
                currentPage === page && 'bg-pink-500 hover:bg-pink-600'
              )}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          )
        )}
      </div>

      {/* Next Page */}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </Button>

      {/* Last Page */}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        <ChevronsRight className="h-4 w-4" />
        <span className="sr-only">Last page</span>
      </Button>
    </div>
  )
}
