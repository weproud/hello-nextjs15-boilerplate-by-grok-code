import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar, Eye, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

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
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link href={`/posts/${post.slug}`}>
              <CardTitle className="text-xl hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </CardTitle>
            </Link>
            {post.excerpt && (
              <p className="text-muted-foreground mt-2 line-clamp-3">
                {post.excerpt}
              </p>
            )}
          </div>
          {!post.published && (
            <Badge variant="secondary" className="ml-4">
              <Eye className="h-3 w-3 mr-1" />
              비공개
            </Badge>
          )}
        </div>

        {/* 메타 정보 */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={post.author.image || ""} />
              <AvatarFallback>
                {post.author.name?.[0] || post.author.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>{post.author.name || post.author.email}</span>
          </div>

          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
                locale: ko,
              })}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{post._count.comments}개의 댓글</span>
          </div>

          {post.category && (
            <Badge
              variant="outline"
              style={{
                borderColor: post.category.color || undefined,
                color: post.category.color || undefined,
              }}
            >
              {post.category.name}
            </Badge>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}
