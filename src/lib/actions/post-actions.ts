"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

import {
  CACHE_TAGS,
  createCachedPostsQuery,
  createCachedPostQuery,
} from "@/lib/cache-queries";

// Schemas
export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, "제목은 필수입니다")
    .max(200, "제목은 200자 이하여야 합니다"),
  content: z.string().min(1, "내용은 필수입니다"),
  published: z.boolean().default(false),
});

export const updatePostSchema = createPostSchema.extend({
  id: z.string().min(1, "게시물 ID가 필요합니다"),
});

// Server Actions
export async function createPost(formData: FormData) {
  try {
    const validatedData = createPostSchema.parse({
      title: formData.get("title"),
      content: formData.get("content"),
      published: formData.get("published") === "true",
    });

    // 현재 사용자 ID를 얻는 로직 (실제로는 세션에서 가져와야 함)
    const authorId = "user-id"; // 임시

    const post = await prisma.post.create({
      data: {
        ...validatedData,
        authorId,
        slug: generateSlug(validatedData.title), // slug 추가
      },
      select: {
        id: true,
        title: true,
        content: true,
        published: true,
        createdAt: true,
        slug: true,
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
    revalidateTag(CACHE_TAGS.POSTS); // 전체 게시물 목록 캐시 무효화
    revalidateTag(CACHE_TAGS.USER_POSTS(authorId)); // 사용자 게시물 캐시 무효화
    revalidatePath("/posts");

    redirect(`/posts/${post.id}`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: "게시물 생성에 실패했습니다" };
  }
}

export async function updatePost(formData: FormData) {
  try {
    const validatedData = updatePostSchema.parse({
      id: formData.get("id"),
      title: formData.get("title"),
      content: formData.get("content"),
      published: formData.get("published") === "true",
    });

    const post = await prisma.post.update({
      where: { id: validatedData.id },
      data: {
        title: validatedData.title,
        content: validatedData.content,
        published: validatedData.published,
        slug: generateSlug(validatedData.title), // slug 업데이트
      },
      select: {
        id: true,
        title: true,
        content: true,
        published: true,
        updatedAt: true,
        slug: true,
      },
    });

    // 새로운 캐싱 API들 적용
    revalidateTag(CACHE_TAGS.POSTS);
    revalidateTag(CACHE_TAGS.POST(validatedData.id));
    revalidatePath("/posts");
    revalidatePath(`/posts/${post.id}`);

    return { success: true, data: post };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: "게시물 수정에 실패했습니다" };
  }
}

export async function deletePost(postId: string) {
  try {
    // 게시물 존재 확인 및 작성자 정보 가져오기
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      return { success: false, error: "게시물을 찾을 수 없습니다" };
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    // 새로운 캐싱 API들 적용
    revalidateTag(CACHE_TAGS.POSTS);
    revalidateTag(CACHE_TAGS.POST(postId));
    revalidateTag(CACHE_TAGS.USER_POSTS(post.authorId));
    revalidatePath("/posts");

    redirect("/posts");
  } catch (error) {
    return { success: false, error: "게시물 삭제에 실패했습니다" };
  }
}

export async function togglePostPublish(postId: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { published: true, authorId: true },
    });

    if (!post) {
      return { success: false, error: "게시물을 찾을 수 없습니다" };
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { published: !post.published },
      select: {
        id: true,
        published: true,
      },
    });

    // 새로운 캐싱 API들 적용
    revalidateTag(CACHE_TAGS.POSTS);
    revalidateTag(CACHE_TAGS.POST(postId));
    revalidateTag(CACHE_TAGS.USER_POSTS(post.authorId));
    revalidatePath("/posts");
    revalidatePath(`/posts/${postId}`);

    return { success: true, data: updatedPost };
  } catch (error) {
    return { success: false, error: "게시물 상태 변경에 실패했습니다" };
  }
}

// 캐시된 데이터 조회 함수들
export const getCachedPosts = createCachedPostsQuery;
export const getCachedPost = createCachedPostQuery;

// 클라이언트 컴포넌트에서 사용할 수 있는 액션 함수들
export async function createPostAction(formData: FormData) {
  "use server";

  try {
    const validatedData = createPostSchema.parse({
      title: formData.get("title"),
      content: formData.get("content"),
      published: formData.get("published") === "true",
    });

    // 현재 사용자 ID를 얻는 로직 (실제로는 세션에서 가져와야 함)
    const authorId = "user-id"; // 임시

    const post = await prisma.post.create({
      data: {
        ...validatedData,
        authorId,
        slug: generateSlug(validatedData.title), // slug 추가
      },
      select: {
        id: true,
        title: true,
        content: true,
        published: true,
        createdAt: true,
        slug: true,
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
    revalidateTag(CACHE_TAGS.POSTS); // 전체 게시물 목록 캐시 무효화
    revalidateTag(CACHE_TAGS.USER_POSTS(authorId)); // 사용자 게시물 캐시 무효화
    revalidatePath("/posts");

    return { success: true, data: post };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: "게시물 생성에 실패했습니다" };
  }
}

// 유틸리티 함수
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // 특수문자 제거
    .replace(/[\s_-]+/g, "-") // 공백과 언더스코어를 하이픈으로
    .replace(/^-+|-+$/g, ""); // 앞뒤 하이픈 제거
}
