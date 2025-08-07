"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/custom/admin/pagination"

export function DataTable({
  data = [],
  columns = [],
  loading = false,
  // Pagination props
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  itemsPerPage = 10,
  total = 0, // total number of results
  // Additional props
  numbered = false,
  showPagination = true,
  className = "",
}) {
  // Calculate start index for numbering
  const startIndex = (currentPage - 1) * itemsPerPage

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-none border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#0077B6] hover:bg-[#0077B6]">
                  {numbered && (
                    <TableHead className="text-white font-bold w-16 px-6 py-4">#</TableHead>
                  )}
                  {columns.map((column, index) => (
                    <TableHead
                      key={index}
                      className={`text-white font-bold px-4 py-4 ${column.className || ""}`}
                    >
                      {column.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-transparent bg-transparent border-0">
                  <TableCell 
                    colSpan={columns.length + (numbered ? 1 : 0)} 
                    className="h-24 text-center"
                  >
                    <div className="flex flex-col items-center justify-center p-8">
                      <div className="inline-flex items-center justify-center w-8 h-8 border-4 border-[#0077B6] border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-2 text-sm text-[#0077B6]">Loading data...</p>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-none border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#0077B6] hover:bg-[#0077B6]">
                {numbered && (
                  <TableHead className="text-white font-bold w-16 px-6 py-4">
                    #
                  </TableHead>
                )}
                {columns.map((column, index) => (
                  <TableHead
                    key={index}
                    className={`text-white font-bold px-4 py-4 ${column.className || ""}`}
                  >
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow className="hover:bg-transparent bg-transparent border-0">
                  <TableCell 
                    colSpan={columns.length + (numbered ? 1 : 0)} 
                    className="h-24 text-center text-gray-500"
                  >
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => (
                  <TableRow 
                    key={index} 
                    className="transition-colors duration-200 hover:bg-[#0077B6]/10"
                  >
                    {numbered && (
                      <TableCell className="font-medium text-[#0077B6] px-6 py-4 w-16">
                        {startIndex + index + 1}
                      </TableCell>
                    )}
                    {columns.map((column, colIndex) => (
                      <TableCell 
                        key={colIndex} 
                        className={`px-4 py-4 max-w-[200px] truncate ${column.className || ""}`}
                      >
                        <div className="max-w-full truncate" title={column.render ? undefined : String(item[column.key] || "")}>
                          {column.render
                            ? column.render(item, startIndex + index)
                            : String(item[column.key] || "")}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {showPagination && totalPages > 1 && total > itemsPerPage && data.length > 0 && !loading && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
          <DataTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  )
}
