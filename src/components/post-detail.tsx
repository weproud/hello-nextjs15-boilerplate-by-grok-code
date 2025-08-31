"use client";

import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  Eye,
  MessageCircle,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { CommentForm } from "@/components/comment-form";
import { CommentList } from "@/components/comment-list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { deletePost } from "@/lib/actions/post-actions";

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string | null;
  published: boolean;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    bio?: string | null;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
    color?: string | null;
    description?: string | null;
  } | null;
  comments: Comment[];
  _count: {
    comments: number;
  };
}

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
  };
  replies?: Comment[];
  parentId?: string | null;
}

interface PostDetailProps {
  post: Post;
}

export function PostDetail({ post }: PostDetailProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeletePost = async () => {
    if (!confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deletePost(post.slug);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("게시글이 삭제되었습니다");
      router.push("/");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("게시글 삭제에 실패했습니다");
    } finally {
      setIsDeleting(false);
    }
  };

  const isAuthor = session?.user?.id === post.author.id;
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 헤더 */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          홈으로 돌아가기
        </Link>

        {/* 게시글 액션 버튼들 */}
        {(isAuthor || isAdmin) && (
          <div className="flex gap-2 mb-4">
            <Link href={`/posts/${post.slug}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                수정
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeletePost}
              disabled={isDeleting}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              삭제
            </Button>
          </div>
        )}
      </div>

      {/* 게시글 헤더 */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

              {post.excerpt && (
                <p className="text-lg text-muted-foreground mb-4">
                  {post.excerpt}
                </p>
              )}

              {/* 작성자 및 메타 정보 */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={post.author.image || ""} />
                    <AvatarFallback>
                      {post.author.name?.[0] ||
                        post.author.email[0].toUpperCase()}
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

                {post.updatedAt > post.createdAt && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      수정됨{" "}
                      {formatDistanceToNow(new Date(post.updatedAt), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{post._count.comments}개의 댓글</span>
                </div>

                {!post.published && (
                  <Badge variant="secondary">
                    <Eye className="h-3 w-3 mr-1" />
                    비공개
                  </Badge>
                )}
              </div>

              {/* 카테고리 */}
              {post.category && (
                <div className="mt-4">
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: post.category.color || undefined,
                      color: post.category.color || undefined,
                    }}
                  >
                    {post.category.name}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 게시글 내용 */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          {/* Tiptap 에디터가 생성한 HTML이므로 안전함 */}
          <div
            className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </CardContent>
      </Card>

      {/* 댓글 섹션 */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            댓글 ({post._count.comments})
          </h2>
        </CardHeader>
        <CardContent>
          {/* 댓글 작성 폼 */}
          <div className="mb-8">
            <CommentForm postSlug={post.slug} />
          </div>

          {/* 댓글 목록 */}
          <CommentList comments={post.comments} postSlug={post.slug} />
        </CardContent>
      </Card>
    </div>
  );
}
