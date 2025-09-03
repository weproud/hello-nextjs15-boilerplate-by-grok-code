import { PostCard } from "@/components/post-card";
import { PostsFilters } from "@/components/posts-filters";
import { PostsPagination } from "@/components/posts-pagination";
import {
  StreamingWrapper,
  SuspenseWrapper,
} from "@/components/suspense-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCachedPosts } from "@/lib/actions/post-actions";
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "게시글 목록",
  description: "모든 게시글을 확인하고 새로운 글을 작성해보세요",
};

// Next.js 15 스트리밍 적용
export const revalidate = 300; // 5분
export const dynamic = "force-dynamic";

// PostsFilters를 위한 래퍼 컴포넌트
async function PostsFiltersWrapper({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  return <PostsFilters searchParams={params} />;
}

// 스트리밍을 위한 데이터 fetching 컴포넌트
async function PostsContent({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const page = params.page ? parseInt(params.page as string, 10) : 1;
  const limit = params.limit ? parseInt(params.limit as string, 10) : 10;

  // Suspense를 활용한 데이터 fetching
  const posts = await getCachedPosts({
    published: true,
    limit,
    offset: (page - 1) * limit,
  })();

  const totalCount = posts.length; // 실제로는 별도 쿼리로 총 개수를 가져와야 함
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <>
      {/* 게시글 목록 - 스트리밍 적용 */}
      <StreamingWrapper priority="high">
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
            {posts.map((post, index) => (
              <StreamingWrapper
                key={post.id}
                priority={index < 3 ? "high" : "normal"}
              >
                <PostCard post={post} />
              </StreamingWrapper>
            ))}
          </div>
        )}
      </StreamingWrapper>

      {/* 페이지네이션 - 낮은 우선순위 스트리밍 */}
      <StreamingWrapper priority="low">
        <PostsPagination
          pagination={{
            page,
            limit,
            total: totalCount,
            totalPages,
          }}
        />
      </StreamingWrapper>

      {/* 통계 - 가장 낮은 우선순위 */}
      <StreamingWrapper priority="low">
        <div className="mt-8 text-center text-sm text-muted-foreground">
          총 {totalCount}개의 게시글
        </div>
      </StreamingWrapper>
    </>
  );
}

export default function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* 헤더 - 즉시 렌더링 */}
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

      {/* 검색 및 필터 - Suspense 적용 */}
      <SuspenseWrapper variant="default">
        <PostsFiltersWrapper searchParams={searchParams} />
      </SuspenseWrapper>

      {/* 게시글 콘텐츠 - 스트리밍 적용 */}
      <SuspenseWrapper variant="posts">
        <PostsContent searchParams={searchParams} />
      </SuspenseWrapper>
    </div>
  );
}
