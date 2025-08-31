"use client";

import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  MessageCircle,
  MoreHorizontal,
  Reply,
  Trash2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { CommentForm } from "@/components/comment-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { deleteComment, updateComment } from "@/lib/actions/comment-actions";

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

interface CommentListProps {
  comments: Comment[];
  postSlug: string;
}

interface CommentItemProps {
  comment: Comment;
  postSlug: string;
  isReply?: boolean;
  onReply?: () => void;
}

function CommentItem({ comment, postSlug, isReply = false }: CommentItemProps) {
  const { data: session } = useSession();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplies, setShowReplies] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAuthor = session?.user?.id === comment.author.id;
  const isAdmin = session?.user?.role === "ADMIN";

  const handleDelete = async () => {
    if (!confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await deleteComment(comment.id);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("댓글이 삭제되었습니다");
      window.location.reload(); // 간단한 리프레시
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("댓글 삭제에 실패했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) {
      toast.error("댓글 내용을 입력해주세요");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("id", comment.id);
      formData.append("content", editContent);

      const result = await updateComment(formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("댓글이 수정되었습니다");
      setIsEditing(false);
      window.location.reload(); // 간단한 리프레시
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("댓글 수정에 실패했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${isReply ? "ml-8 mt-4" : "mb-6"}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.author.image || ""} />
          <AvatarFallback>
            {comment.author.name?.[0] || comment.author.email[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* 댓글 헤더 */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-sm">
              {comment.author.name || comment.author.email}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
                locale: ko,
              })}
            </span>
            {comment.updatedAt > comment.createdAt && (
              <Badge variant="outline" className="text-xs">
                수정됨
              </Badge>
            )}
          </div>

          {/* 댓글 내용 */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border rounded-md resize-none text-sm"
                rows={3}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleEdit} disabled={isSubmitting}>
                  수정
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                >
                  취소
                </Button>
              </div>
            </div>
          ) : (
            // Tiptap 에디터가 생성한 HTML이므로 안전함
            <div
              className="text-sm prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: comment.content }}
            />
          )}

          {/* 댓글 액션들 */}
          {!isEditing && (
            <div className="flex items-center gap-2 mt-2">
              {session?.user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReplying(!isReplying)}
                  className="h-8 px-2 text-xs"
                >
                  <Reply className="h-3 w-3 mr-1" />
                  답글
                </Button>
              )}

              {(isAuthor || isAdmin) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      수정
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}

          {/* 답글 작성 폼 */}
          {isReplying && (
            <div className="mt-4">
              <CommentForm
                postSlug={postSlug}
                parentId={comment.id}
                onSuccess={() => {
                  setIsReplying(false);
                  window.location.reload(); // 간단한 리프레시
                }}
                placeholder={`${
                  comment.author.name || comment.author.email
                }님에게 답글...`}
              />
            </div>
          )}

          {/* 답글들 */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplies(!showReplies)}
                className="h-8 px-2 text-xs mb-2"
              >
                {showReplies ? (
                  <ChevronUp className="h-3 w-3 mr-1" />
                ) : (
                  <ChevronDown className="h-3 w-3 mr-1" />
                )}
                답글 {comment.replies.length}개{" "}
                {showReplies ? "숨기기" : "보기"}
              </Button>

              {showReplies && (
                <div className="space-y-4">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      postSlug={postSlug}
                      isReply={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {!isReply && <Separator className="mt-6" />}
    </div>
  );
}

export function CommentList({ comments, postSlug }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">아직 댓글이 없습니다</h3>
        <p className="text-muted-foreground">첫 번째 댓글을 작성해보세요</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} postSlug={postSlug} />
      ))}
    </div>
  );
}
