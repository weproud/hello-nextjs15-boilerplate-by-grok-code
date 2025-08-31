"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  COMMENT_CACHE_TAGS,
  createCachedCommentsQuery,
} from "@/lib/cache-queries";

// Schemas
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "댓글 내용은 필수입니다")
    .max(1000, "댓글은 1000자 이하여야 합니다"),
  postId: z.string().min(1, "게시물 ID가 필요합니다"),
});

export const updateCommentSchema = z.object({
  id: z.string().min(1, "댓글 ID가 필요합니다"),
  content: z
    .string()
    .min(1, "댓글 내용은 필수입니다")
    .max(1000, "댓글은 1000자 이하여야 합니다"),
});

// Server Actions
export async function createComment(formData: FormData) {
  "use server";

  try {
    const validatedData = createCommentSchema.parse({
      content: formData.get("content"),
      postId: formData.get("postId"),
    });

    // 현재 사용자 ID를 얻는 로직 (실제로는 세션에서 가져와야 함)
    const authorId = "user-id"; // 임시

    const comment = await prisma.comment.create({
      data: {
        ...validatedData,
        authorId,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // 새로운 캐싱 API들 적용
    revalidateTag(COMMENT_CACHE_TAGS.POST_COMMENTS(validatedData.postId));
    revalidateTag(COMMENT_CACHE_TAGS.COMMENTS);
    revalidatePath(`/posts/${validatedData.postId}`);

    return { success: true, data: comment };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: "댓글 작성에 실패했습니다" };
  }
}

export async function updateComment(formData: FormData) {
  "use server";

  try {
    const validatedData = updateCommentSchema.parse({
      id: formData.get("id"),
      content: formData.get("content"),
    });

    const comment = await prisma.comment.update({
      where: { id: validatedData.id },
      data: { content: validatedData.content },
      select: {
        id: true,
        content: true,
        updatedAt: true,
        postId: true,
      },
    });

    // 새로운 캐싱 API들 적용
    revalidateTag(COMMENT_CACHE_TAGS.POST_COMMENTS(comment.postId));
    revalidateTag(COMMENT_CACHE_TAGS.COMMENT(validatedData.id));
    revalidatePath(`/posts/${comment.postId}`);

    return { success: true, data: comment };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: "댓글 수정에 실패했습니다" };
  }
}

export async function deleteComment(commentId: string) {
  "use server";

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { postId: true },
    });

    if (!comment) {
      return { success: false, error: "댓글을 찾을 수 없습니다" };
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    // 새로운 캐싱 API들 적용
    revalidateTag(COMMENT_CACHE_TAGS.POST_COMMENTS(comment.postId));
    revalidateTag(COMMENT_CACHE_TAGS.COMMENT(commentId));
    revalidateTag(COMMENT_CACHE_TAGS.COMMENTS);
    revalidatePath(`/posts/${comment.postId}`);

    return { success: true };
  } catch (error) {
    return { success: false, error: "댓글 삭제에 실패했습니다" };
  }
}

// 캐시된 데이터 조회 함수들
export const getCachedComments = createCachedCommentsQuery;
