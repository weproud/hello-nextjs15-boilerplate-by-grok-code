import { z } from "zod";

// Comment 관련 스키마들
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "댓글 내용을 입력해주세요")
    .max(1000, "댓글은 1000자 이하여야 합니다"),
  postId: z.string().min(1, "게시물 ID가 필요합니다"),
});

export const updateCommentSchema = z.object({
  id: z.string().min(1, "댓글 ID가 필요합니다"),
  content: z
    .string()
    .min(1, "댓글 내용을 입력해주세요")
    .max(1000, "댓글은 1000자 이하여야 합니다"),
});

export const commentSearchSchema = z.object({
  postId: z.string().min(1, "게시물 ID가 필요합니다"),
  sortBy: z.enum(["newest", "oldest"]).default("newest"),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
});

export type CreateCommentFormData = z.infer<typeof createCommentSchema>;
export type UpdateCommentFormData = z.infer<typeof updateCommentSchema>;
export type CommentSearchFormData = z.infer<typeof commentSearchSchema>;
