"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const Pagination = React.forwardRef(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    role="navigation"
    aria-label="pagination"
    className={cn("w-auto", className)}
    {...props}
  />
))
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-2", className)}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

const PaginationLink = React.forwardRef(({ className, isActive, size = "icon", ...props }, ref) => (
  <Button
    ref={ref}
    aria-current={isActive ? "page" : undefined}
    variant={isActive ? "default" : "outline"}
    size={size}
    className={cn(
      "h-8 w-8 p-0 cursor-pointer",
      isActive && "bg-[#0077B6] hover:bg-[#005f8a] text-white border-[#0077B6]",
      !isActive && "border-gray-200 text-gray-600 hover:text-white hover:bg-[#0077B6] bg-transparent",
      className
    )}
    {...props}
  />
))
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = React.forwardRef(({ className, ...props }, ref) => (
  <PaginationLink
    ref={ref}
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 px-3 py-2 h-8 w-auto text-white hover:text-white bg-[#0077B6] border-[#0077B6] hover:bg-[#005f8a]", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
))
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = React.forwardRef(({ className, ...props }, ref) => (
  <PaginationLink
    ref={ref}
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 px-3 py-2 h-8 w-auto text-white hover:text-white bg-[#0077B6] border-[#0077B6] hover:bg-[#005f8a]", className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
))
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = React.forwardRef(({ className, ...props }, ref) => (
  <span
    ref={ref}
    aria-hidden
    className={cn("flex h-8 w-8 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4 text-gray-400" />
    <span className="sr-only">More pages</span>
  </span>
))
PaginationEllipsis.displayName = "PaginationEllipsis"

const DataTablePagination = React.forwardRef(({ 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange,
  showPreviousNext = true,
  maxVisiblePages = 5,
  className,
  ...props 
}, ref) => {
  const generatePageNumbers = React.useMemo(() => {
    const pageNumbers = []
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push("ellipsis")
        pageNumbers.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1)
        pageNumbers.push("ellipsis")
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i)
        }
      } else {
        pageNumbers.push(1)
        pageNumbers.push("ellipsis")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push("ellipsis")
        pageNumbers.push(totalPages)
      }
    }
    
    return pageNumbers
  }, [currentPage, totalPages, maxVisiblePages])

  if (totalPages <= 1) return null

  return (
    <Pagination ref={ref} className={className} {...props}>
      <PaginationContent>
        {showPreviousNext && (
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange?.(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className={currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}
            />
          </PaginationItem>
        )}
        
        {generatePageNumbers.map((pageNumber, index) => (
          <PaginationItem key={index}>
            {pageNumber === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                onClick={() => onPageChange?.(pageNumber)}
                isActive={currentPage === pageNumber}
                aria-current={currentPage === pageNumber ? "page" : undefined}
              >
                {pageNumber}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        
        {showPreviousNext && (
          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange?.(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  )
})
DataTablePagination.displayName = "DataTablePagination"

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  DataTablePagination,
}
