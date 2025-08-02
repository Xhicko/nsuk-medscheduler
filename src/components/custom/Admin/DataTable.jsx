"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function DataTable({
  data,
  columns,
  itemsPerPage = 10,
  showPagination = true,
  numbered = false,
}) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = data.slice(startIndex, endIndex)

  const shouldShowPagination = showPagination && data.length > itemsPerPage

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#0077B6]">
            <tr>
              {numbered && <th className="px-6 py-4 text-sm font-medium text-left text-white">#</th>}
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`text-left py-4 px-4 font-bold text-white text-sm ${column.className || ""}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentData.map((item, index) => (
              <tr key={index} className="transition-colors duration-200 hover:bg-[#0077B6]/20 cursor-pointer">
                {numbered && <td className="px-6 py-4 font-medium text-[#0077B6]">{startIndex + index + 1}</td>}
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className={`py-4 px-4 ${column.className || ""}`}>
                    {column.render
                      ? column.render(item, startIndex + index)
                      : String(item[column.key] || "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {shouldShowPagination && (
        <div className="flex items-center justify-between px-6 py-6 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="text-gray-600 bg-transparent border-gray-200 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={
                  currentPage === page
                    ? "bg-[#14C38E] hover:bg-[#0ea770] text-white"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50 bg-transparent"
                }
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="text-gray-600 bg-transparent border-gray-200 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
