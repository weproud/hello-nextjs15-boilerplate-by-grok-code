import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar, Eye, MessageCircle } from "lucide-react";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
  } | null;
  _count: {
    comments: number;
  };
}

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const postDate = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: ko,
  });

  // 접근성을 위한 정보 구성
  const accessibilityInfo = {
    title: post.title,
    author: post.author.name || post.author.email,
    date: postDate,
    comments: `${post._count.comments}개의 댓글`,
    status: post.published ? "공개 게시글" : "비공개 게시글",
    category: post.category?.name || null,
  };

  return (
    <Card
      className="hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
      role="article"
      aria-labelledby={`post-title-${post.id}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link
              href={`/posts/${post.slug}`}
              className="group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
              aria-describedby={`post-meta-${post.id}`}
            >
              <CardTitle
                id={`post-title-${post.id}`}
                className="text-xl hover:text-primary transition-colors line-clamp-2 group-focus:text-primary"
              >
                {post.title}
              </CardTitle>
            </Link>
            {post.excerpt && (
              <p
                className="text-muted-foreground mt-2 line-clamp-3"
                aria-label="게시글 요약"
              >
                {post.excerpt}
              </p>
            )}
          </div>
          {!post.published && (
            <Badge
              variant="secondary"
              className="ml-4"
              aria-label="비공개 게시글"
            >
              <Eye className="h-3 w-3 mr-1" aria-hidden="true" />
              비공개
            </Badge>
          )}
        </div>

        {/* 메타 정보 - 접근성 강화 */}
        <div
          id={`post-meta-${post.id}`}
          className="flex items-center gap-4 text-sm text-muted-foreground mt-4"
          role="group"
          aria-label="게시글 정보"
        >
          <div
            className="flex items-center gap-2"
            role="group"
            aria-label="작성자 정보"
          >
            <Avatar className="h-6 w-6" aria-hidden="true">
              <AvatarImage
                src={post.author.image || ""}
                alt={`${accessibilityInfo.author} 프로필 이미지`}
              />
              <AvatarFallback aria-hidden="true">
                {post.author.name?.[0] || post.author.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span aria-label={`작성자: ${accessibilityInfo.author}`}>
              {post.author.name || post.author.email}
            </span>
          </div>

          <div
            className="flex items-center gap-1"
            role="group"
            aria-label="게시 날짜"
          >
            <Calendar className="h-4 w-4" aria-hidden="true" />
            <time
              dateTime={post.createdAt.toISOString()}
              aria-label={`게시일: ${postDate}`}
            >
              {postDate}
            </time>
          </div>

          <div
            className="flex items-center gap-1"
            role="group"
            aria-label="댓글 수"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            <span aria-label={accessibilityInfo.comments}>
              {post._count.comments}개
            </span>
          </div>

          {post.category && (
            <Badge
              variant="outline"
              style={{
                borderColor: post.category.color || undefined,
                color: post.category.color || undefined,
              }}
              aria-label={`카테고리: ${post.category.name}`}
            >
              {post.category.name}
            </Badge>
          )}
        </div>

        {/* 스크린 리더를 위한 숨겨진 정보 */}
        <div className="sr-only">
          {accessibilityInfo.status} - {accessibilityInfo.title} by{" "}
          {accessibilityInfo.author}
        </div>
      </CardHeader>
    </Card>
  );
}
