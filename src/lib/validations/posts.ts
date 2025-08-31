import { z } from "zod";

// Post 관련 스키마들
export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, "제목을 입력해주세요")
    .max(200, "제목은 200자 이하여야 합니다"),
  content: z
    .string()
    .min(1, "내용을 입력해주세요")
    .max(10000, "내용은 10,000자 이하여야 합니다"),
  published: z.boolean().default(false),
});

export const updatePostSchema = createPostSchema.extend({
  id: z.string().min(1, "게시물 ID가 필요합니다"),
});

export const postSearchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  published: z.enum(["all", "published", "draft"]).default("all"),
  sortBy: z.enum(["newest", "oldest", "popular"]).default("newest"),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export type CreatePostFormData = z.infer<typeof createPostSchema>;
export type UpdatePostFormData = z.infer<typeof updatePostSchema>;
export type PostSearchFormData = z.infer<typeof postSearchSchema>;
