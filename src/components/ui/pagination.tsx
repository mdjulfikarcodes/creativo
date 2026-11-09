"use client";

import { useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type PaginationProps = {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  category: string;
};

export function Pagination({
  totalPages,
  currentPage,
  onPageChange,
  category,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const handlePageChange = useCallback(
    (nextPage: number) => {
      const page = Math.max(1, Math.min(nextPage, totalPages));
      if (page === currentPage) {
        return;
      }
      onPageChange(page);
    },
    [currentPage, totalPages, onPageChange],
  );

  const pageNumbers: number[] = [];
  for (let i = 1; i <= totalPages; i = i + 1) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex items-center justify-between gap-2 sm:justify-end">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4 shrink-0" />
      </Button>

      <div className="flex items-center gap-1">
        {pageNumbers.map((pageNumber) => {
          const isActive = pageNumber === currentPage;
          return (
            <Button
              key={pageNumber}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className={isActive ? "z-10" : ""}
              onClick={() => handlePageChange(pageNumber)}
              aria-current={isActive ? "page" : undefined}
            >
              {pageNumber}
            </Button>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4 shrink-0" />
      </Button>
    </div>
  );
}
