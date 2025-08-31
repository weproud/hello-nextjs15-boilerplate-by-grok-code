"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { createPostAction } from "@/lib/actions/post-actions";

// 폼 스키마
const postSchema = z.object({
  title: z
    .string()
    .min(1, "제목은 필수입니다")
    .max(200, "제목은 200자 이하여야 합니다"),
  content: z.string().min(1, "내용은 필수입니다"),
  excerpt: z.string().optional(),
  categoryId: z.string().optional(),
  published: z.boolean().optional(),
});

type PostFormData = z.infer<typeof postSchema>;

export default function CreatePostPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState<string>("");
  const [isContentValid, setIsContentValid] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      published: false,
    },
  });

  // Content를 폼에 등록 (타입 안전하게)
  React.useEffect(() => {
    setValue("content" as any, content);
  }, [content, setValue]);

  const published = watch("published");

  // Content 검증 함수
  const validateContent = (value: string) => {
    const trimmed = value?.trim() || "";
    const isValid = trimmed.length > 0 && trimmed !== "<p></p>";
    console.log("=== Content Validation ===");
    console.log("Input value:", `"${value}"`);
    console.log("Trimmed value:", `"${trimmed}"`);
    console.log("Is valid:", isValid);
    console.log("Validation checks:", {
      hasLength: trimmed.length > 0,
      notEmptyParagraph: trimmed !== "<p></p>",
      finalResult: isValid,
    });
    setIsContentValid(isValid);
    return trimmed;
  };

  // Content 변경 핸들러
  const handleContentChange = (value: string) => {
    const trimmedValue = validateContent(value);
    setContent(trimmedValue);
  };

  const onSubmit = async (data: PostFormData) => {
    console.log("🎯 === onSubmit 함수 시작 ===");
    console.log("Form data:", data);
    console.log("Content state:", content);
    console.log("Content valid:", isContentValid);
    console.log("Content trimmed:", content?.trim());
    console.log("Content length:", content?.length);

    // 폼 데이터 검증
    console.log("Title from form:", data.title);
    console.log("Title trimmed:", data.title?.trim());

    // Content 검증 강화
    const finalContent = content?.trim() || "";
    console.log("Final content:", finalContent);

    if (
      !finalContent ||
      finalContent === "<p></p>" ||
      finalContent.length === 0
    ) {
      console.error("❌ Content validation failed:", {
        finalContent,
        length: finalContent.length,
      });
      toast.error("내용을 입력해주세요");
      return;
    }

    console.log("✅ All validations passed, proceeding to server action");

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", data.title.trim());
      formData.append("content", finalContent);
      if (data.excerpt?.trim()) {
        formData.append("excerpt", data.excerpt.trim());
      }
      if (data.categoryId) {
        formData.append("categoryId", data.categoryId);
      }
      formData.append("published", data.published ? "true" : "false");

      console.log("Sending form data to server action");
      console.log("Content type:", typeof finalContent);
      console.log("Content value:", `"${finalContent}"`);

      const result = await createPostAction(formData);

      console.log("Server action result:", result);

      if (!result.success) {
        toast.error("게시글 생성에 실패했습니다");
        return;
      }

      if (!result.data?.slug) {
        toast.error("게시글 생성에 실패했습니다");
        return;
      }

      toast.success("게시글이 성공적으로 생성되었습니다");
      router.push(`/posts/${result.data.slug}`);
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error(
        error instanceof Error ? error.message : "게시글 생성에 실패했습니다"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          뒤로가기
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>새 게시글 작성</CardTitle>
          <CardDescription>
            Tiptap 에디터를 사용하여 아름다운 게시글을 작성해보세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit, (errors) => {
              console.log("❌ Form validation failed:", errors);
              console.log("Form errors object:", errors);
              if (errors.title) console.log("Title error:", errors.title);
              if (errors.content) console.log("Content error:", errors.content);
            })}
            onSubmitCapture={(e) => {
              console.log("📝 Form onSubmitCapture triggered");
              console.log("Event:", e);
            }}
            className="space-y-6"
          >
            {/* 제목 */}
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                placeholder="게시글 제목을 입력하세요"
                {...register("title")}
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
              <div className="text-xs text-muted-foreground">
                Title 값: "{watch("title") || "비어있음"}" | 길이:{" "}
                {watch("title")?.length || 0}
              </div>
            </div>

            {/* 요약 */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">요약 (선택사항)</Label>
              <Textarea
                id="excerpt"
                placeholder="게시글의 간단한 요약을 입력하세요"
                {...register("excerpt")}
                rows={3}
              />
            </div>

            {/* 카테고리 */}
            <div className="space-y-2">
              <Label htmlFor="category">카테고리 (선택사항)</Label>
              <Select onValueChange={(value) => setValue("categoryId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech">기술</SelectItem>
                  <SelectItem value="design">디자인</SelectItem>
                  <SelectItem value="business">비즈니스</SelectItem>
                  <SelectItem value="lifestyle">라이프스타일</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 내용 */}
            <div className="space-y-2">
              <Label>내용</Label>
              <TiptapEditor
                content={content}
                onChange={handleContentChange}
                placeholder="게시글 내용을 작성하세요..."
              />
              {errors.content && (
                <p className="text-sm text-destructive">
                  {errors.content.message}
                </p>
              )}
              <input type="hidden" {...register("content")} />
              <div className="text-xs text-muted-foreground mt-1">
                Content 상태: {isContentValid ? "✅ 유효" : "❌ 유효하지 않음"}{" "}
                | 길이: {content?.length || 0} | 값: "
                {content?.substring(0, 20)}
                {content && content.length > 20 ? "..." : ""}"
              </div>
              <div className="text-xs text-blue-600 mt-1">
                💡 디버그: 제목을 입력하고 "게시글 생성" 버튼을 클릭해보세요
                <br />
                📝 현재 상태 - Title: "{watch("title") || "비어있음"}" |
                Content: {isContentValid ? "✅ 유효" : "❌ 유효하지 않음"}
                <br />
                🔍 Form Content: "{watch("content") || "undefined"}"
              </div>
            </div>

            {/* 공개 설정 */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="published">공개 게시글</Label>
                <p className="text-sm text-muted-foreground">
                  체크하면 게시글이 공개되어 다른 사용자들이 볼 수 있습니다
                </p>
              </div>
              <Switch
                id="published"
                checked={published}
                onCheckedChange={(checked) => setValue("published", checked)}
              />
            </div>

            {/* 버튼들 */}
            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !isContentValid}
                onClick={() => {
                  console.log("=== 버튼 클릭됨 ===");
                  console.log("Content valid state:", isContentValid);
                  console.log("Current content:", content);
                }}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                게시글 생성
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
