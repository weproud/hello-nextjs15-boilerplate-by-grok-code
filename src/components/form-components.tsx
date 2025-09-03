"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// 기본 텍스트 필드 컴포넌트
export function TextField({
  name,
  label,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
  className,
}: {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// 텍스트 영역 컴포넌트
export function TextAreaField({
  name,
  label,
  placeholder,
  rows = 4,
  required = false,
  disabled = false,
  className,
}: {
  name: string;
  label: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <Textarea
              {...field}
              placeholder={placeholder}
              rows={rows}
              disabled={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// 스위치 필드 컴포넌트
export function SwitchField({
  name,
  label,
  description,
  disabled = false,
  className,
}: {
  name: string;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem
          className={`flex flex-row items-center justify-between rounded-lg border p-4 ${className}`}
        >
          <div className="space-y-0.5">
            <FormLabel className="text-base">{label}</FormLabel>
            {description && (
              <div className="text-sm text-muted-foreground">{description}</div>
            )}
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}

// 범용 폼 래퍼 컴포넌트
interface GenericFormProps {
  schema: z.ZodType<any>;
  defaultValues: any;
  onSubmit: (values: any) => Promise<void> | void;
  title?: string;
  description?: string;
  submitButtonText?: string;
  cancelButtonText?: string;
  onCancel?: () => void;
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function GenericForm({
  schema,
  defaultValues,
  onSubmit,
  title,
  description,
  submitButtonText = "저장",
  cancelButtonText = "취소",
  onCancel,
  isLoading = false,
  children,
  className,
}: GenericFormProps) {
  const form = useForm({
    resolver: zodResolver(schema as any),
    defaultValues,
  });

  const handleSubmit = async (values: any) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
      )}
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {children}

            <div className="flex justify-end space-x-2 pt-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  <X className="mr-2 h-4 w-4" />
                  {cancelButtonText}
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                {submitButtonText}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// 게시물 폼 스키마
export const postFormSchema = z.object({
  title: z
    .string()
    .min(1, "제목은 필수입니다")
    .max(200, "제목은 200자 이하여야 합니다"),
  content: z.string().min(1, "내용은 필수입니다"),
  published: z.boolean().default(false),
});

// 게시물 폼 컴포넌트
interface PostFormProps {
  initialData?: {
    title: string;
    content: string;
    published: boolean;
  };
  onSubmit: (data: z.infer<typeof postFormSchema>) => Promise<void> | void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function PostForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}: PostFormProps) {
  const defaultValues = {
    title: initialData?.title || "",
    content: initialData?.content || "",
    published: initialData?.published || false,
  };

  return (
    <GenericForm
      schema={postFormSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
      title={initialData ? "게시물 수정" : "새 게시물 작성"}
      description={
        initialData
          ? "게시물 정보를 수정하세요."
          : "새로운 게시물을 작성하세요."
      }
      className={className}
    >
      <TextField
        name="title"
        label="제목"
        placeholder="게시물 제목을 입력하세요"
        required
      />

      <TextAreaField
        name="content"
        label="내용"
        placeholder="게시물 내용을 입력하세요"
        rows={8}
        required
      />

      <SwitchField
        name="published"
        label="공개 설정"
        description="체크하면 게시물이 공개됩니다"
      />
    </GenericForm>
  );
}

// 댓글 폼 스키마
export const commentFormSchema = z.object({
  content: z
    .string()
    .min(1, "댓글 내용은 필수입니다")
    .max(1000, "댓글은 1000자 이하여야 합니다"),
});

// 댓글 폼 컴포넌트
interface CommentFormProps {
  onSubmit: (data: z.infer<typeof commentFormSchema>) => Promise<void> | void;
  isLoading?: boolean;
  placeholder?: string;
  submitButtonText?: string;
  className?: string;
}

export function CommentForm({
  onSubmit,
  isLoading = false,
  placeholder = "댓글을 입력하세요...",
  submitButtonText = "댓글 작성",
  className,
}: CommentFormProps) {
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await onSubmit({ content: content.trim() });
      setContent("");
    } catch (error) {
      console.error("Comment submission error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        disabled={isLoading}
      />
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          {content.length}/1000자
        </span>
        <Button
          type="submit"
          disabled={isLoading || !content.trim() || content.length > 1000}
          size="sm"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
}
