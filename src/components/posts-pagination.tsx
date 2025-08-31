import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PostsPaginationProps {
  pagination: PaginationInfo;
  baseUrl?: string;
}

export function PostsPagination({
  pagination,
  baseUrl = "/posts",
}: PostsPaginationProps) {
  if (pagination.totalPages <= 1) return null;

  const { page, limit, totalPages } = pagination;

  // 현재 페이지 주변의 페이지 번호들 계산
  const getVisiblePages = () => {
    const delta = 2; // 현재 페이지 양옆으로 보여줄 페이지 수
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(totalPages - 1, page + delta);
      i++
    ) {
      range.push(i);
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (page + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex justify-center mt-8">
      <div className="flex gap-2">
        {/* 이전 페이지 */}
        {page > 1 && (
          <Link href={`${baseUrl}?page=${page - 1}&limit=${limit}`}>
            <Button variant="outline" size="sm">
              이전
            </Button>
          </Link>
        )}

        {/* 페이지 번호들 */}
        {visiblePages.map((pageNum, index) => {
          if (pageNum === "...") {
            return (
              <span
                key={`dots-${index}`}
                className="px-3 py-2 text-muted-foreground"
              >
                ...
              </span>
            );
          }

          const num = pageNum as number;
          return (
            <Link key={num} href={`${baseUrl}?page=${num}&limit=${limit}`}>
              <Button variant={num === page ? "default" : "outline"} size="sm">
                {num}
              </Button>
            </Link>
          );
        })}

        {/* 다음 페이지 */}
        {page < totalPages && (
          <Link href={`${baseUrl}?page=${page + 1}&limit=${limit}`}>
            <Button variant="outline" size="sm">
              다음
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
