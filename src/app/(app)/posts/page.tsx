import { ArrowLeft, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { PostsFilters } from "@/components/posts-filters";
import { PostsPagination } from "@/components/posts-pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCachedPosts } from "@/lib/actions/post-actions";

export const metadata: Metadata = {
  title: "게시글 목록",
  description: "모든 게시글을 확인하고 새로운 글을 작성해보세요",
};

// 새로운 캐싱 API 적용
export const revalidate = 300; // 5분
export const dynamic = "force-dynamic"; // 동적 렌더링 (실시간 데이터 필요시)

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  // 새로운 캐싱 API 적용
  const page = params.page ? parseInt(params.page as string, 10) : 1;
  const limit = params.limit ? parseInt(params.limit as string, 10) : 10;

  let posts: Awaited<ReturnType<typeof getCachedPosts>> = [];
  let totalCount = 0;

  try {
    // 캐시된 데이터 조회 함수 사용
    posts = await getCachedPosts({
      published: true, // 공개된 게시글만
      limit,
      offset: (page - 1) * limit,
    })();
    totalCount = posts.length; // 실제로는 별도 쿼리로 총 개수를 가져와야 함
  } catch (error) {
    console.error("Error fetching posts:", error);
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">
            게시글을 불러올 수 없습니다
          </h2>
          <p className="text-muted-foreground mb-6">
            잠시 후 다시 시도해주세요
          </p>
          <Link href="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              홈으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">게시글</h1>
          <p className="text-muted-foreground">
            다양한 주제의 게시글을 확인하고 의견을 공유해보세요
          </p>
        </div>
        <Link href="/posts/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />새 글 작성
          </Button>
        </Link>
      </div>

      {/* 검색 및 필터 */}
      <PostsFilters searchParams={params} />

      {/* 게시글 목록 */}
      {posts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  role="img"
                  aria-label="게시글 없음"
                >
                  <title>게시글 없음</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">게시글이 없습니다</h3>
              <p className="text-muted-foreground mb-6">
                첫 번째 게시글을 작성해보세요
              </p>
              <Link href="/posts/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />새 글 작성
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      <PostsPagination
        pagination={{
          page,
          limit,
          total: totalCount,
          totalPages,
        }}
      />

      {/* 통계 */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        총 {totalCount}개의 게시글
      </div>
    </div>
  );
}
