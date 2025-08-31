"use client";

import { Loader2, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { createComment } from "@/lib/actions/comment-actions";

interface CommentFormProps {
  postSlug: string;
  parentId?: string;
  onSuccess?: () => void;
  placeholder?: string;
}

export function CommentForm({
  postSlug,
  parentId,
  onSuccess,
  placeholder = "댓글을 작성하세요...",
}: CommentFormProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("댓글 내용을 입력해주세요");
      return;
    }

    if (!session?.user) {
      toast.error("로그인이 필요합니다");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("content", content);
      if (parentId) {
        formData.append("parentId", parentId);
      }

      const result = await createComment(formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success(
        parentId ? "답글이 작성되었습니다" : "댓글이 작성되었습니다"
      );
      setContent("");
      onSuccess?.();
    } catch (error) {
      console.error("Error creating comment:", error);
      toast.error("댓글 작성에 실패했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session?.user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              댓글을 작성하려면 로그인하세요
            </h3>
            <p className="text-muted-foreground mb-4">
              로그인하여 다른 사용자들과 의견을 공유해보세요
            </p>
            <Link href="/auth/signin">
              <Button>로그인하기</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session.user.image || ""} />
              <AvatarFallback>
                {session.user.name?.[0] ||
                  session.user.email?.[0]?.toUpperCase() ||
                  "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholder}
                rows={3}
                className="resize-none"
              />
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {content.length}/1000자
                </p>
                <div className="flex gap-2">
                  {content && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setContent("")}
                    >
                      취소
                    </Button>
                  )}
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!content.trim() || isSubmitting}
                  >
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {parentId ? "답글 작성" : "댓글 작성"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
