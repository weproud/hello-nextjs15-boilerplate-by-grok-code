import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

// 캐시 태그 상수들
export const CACHE_TAGS = {
  POSTS: "posts",
  POST: (id: string) => `post-${id}`,
  USER_POSTS: (userId: string) => `user-posts-${userId}`,
} as const;

export const COMMENT_CACHE_TAGS = {
  COMMENTS: "comments",
  POST_COMMENTS: (postId: string) => `post-comments-${postId}`,
  COMMENT: (id: string) => `comment-${id}`,
} as const;

export const USER_CACHE_TAGS = {
  USERS: "users",
  USER: (id: string) => `user-${id}`,
  USER_PROFILE: (id: string) => `user-profile-${id}`,
} as const;

// 게시글 캐시 쿼리 함수들
export function createCachedPostsQuery(
  options: { published?: boolean; limit?: number; offset?: number } = {},
) {
  return unstable_cache(
    async () => {
      const { published, limit = 10, offset = 0 } = options;

      return prisma.post.findMany({
        where: published !== undefined ? { published } : {},
        select: {
          id: true,
          title: true,
          content: true,
          published: true,
          createdAt: true,
          updatedAt: true,
          slug: true,
          excerpt: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      });
    },
    ["posts-list"],
    {
      revalidate: 300, // 5분
      tags: [CACHE_TAGS.POSTS],
    },
  );
}

export function createCachedPostQuery(postId: string) {
  return unstable_cache(
    async () => {
      return prisma.post.findUnique({
        where: { id: postId },
        select: {
          id: true,
          title: true,
          content: true,
          published: true,
          createdAt: true,
          updatedAt: true,
          slug: true,
          excerpt: true, // excerpt 추가
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              bio: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true,
              description: true,
            },
          },
          comments: {
            select: {
              id: true,
              content: true,
              createdAt: true,
              updatedAt: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
              replies: {
                select: {
                  id: true,
                  content: true,
                  createdAt: true,
                  updatedAt: true,
                  author: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      image: true,
                    },
                  },
                },
                orderBy: { createdAt: "asc" },
              },
            },
            where: {
              parentId: null, // 최상위 댓글만
            },
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      });
    },
    [`post-detail-${postId}`],
    {
      revalidate: 60, // 1분
      tags: [CACHE_TAGS.POST(postId)], // 동적 태그 사용
    },
  );
}

// 댓글 캐시 쿼리 함수들
export function createCachedCommentsQuery(postId: string) {
  return unstable_cache(
    async () => {
      return prisma.comment.findMany({
        where: { postId },
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });
    },
    [`post-comments-${postId}`],
    {
      revalidate: 60, // 1분
      tags: [
        COMMENT_CACHE_TAGS.POST_COMMENTS(postId),
        COMMENT_CACHE_TAGS.COMMENTS,
      ],
    },
  );
}

// 사용자 캐시 쿼리 함수들
export function createCachedUserQuery(userId: string) {
  return unstable_cache(
    async () => {
      return prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              posts: true,
              comments: true,
            },
          },
        },
      });
    },
    [`user-profile-${userId}`],
    {
      revalidate: 300, // 5분
      tags: [
        USER_CACHE_TAGS.USER(userId),
        USER_CACHE_TAGS.USER_PROFILE(userId),
      ],
    },
  );
}

export function createCachedUsersQuery(
  options: { limit?: number; offset?: number } = {},
) {
  return unstable_cache(
    async () => {
      const { limit = 10, offset = 0 } = options;

      return prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
              comments: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      });
    },
    ["users-list"],
    {
      revalidate: 600, // 10분
      tags: [USER_CACHE_TAGS.USERS],
    },
  );
}
