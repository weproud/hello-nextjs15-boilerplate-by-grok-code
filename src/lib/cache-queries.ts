import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

// 캐시 태그 상수들 - Next.js 15의 태그 기반 무효화 활용
export const CACHE_TAGS = {
  POSTS: "posts",
  POSTS_PUBLISHED: "posts-published",
  POSTS_DRAFT: "posts-draft",
  POST: (id: string) => `post-${id}`,
  USER_POSTS: (userId: string) => `user-posts-${userId}`,
  CATEGORY_POSTS: (categoryId: string) => `category-posts-${categoryId}`,
} as const;

export const COMMENT_CACHE_TAGS = {
  COMMENTS: "comments",
  POST_COMMENTS: (postId: string) => `post-comments-${postId}`,
  COMMENT: (id: string) => `comment-${id}`,
  COMMENT_REPLIES: (commentId: string) => `comment-replies-${commentId}`,
} as const;

export const USER_CACHE_TAGS = {
  USERS: "users",
  USER: (id: string) => `user-${id}`,
  USER_PROFILE: (id: string) => `user-profile-${id}`,
  USER_STATS: (id: string) => `user-stats-${id}`,
} as const;

// 캐시 설정 상수들
export const CACHE_CONFIG = {
  // 게시글 캐시 설정
  POSTS: {
    revalidate: 300, // 5분
    tags: [CACHE_TAGS.POSTS],
  },
  POST_DETAIL: {
    revalidate: 60, // 1분
    tags: (id: string) => [CACHE_TAGS.POST(id)],
  },
  USER_PROFILE: {
    revalidate: 600, // 10분
    tags: (id: string) => [USER_CACHE_TAGS.USER_PROFILE(id)],
  },
  COMMENTS: {
    revalidate: 120, // 2분
    tags: (postId: string) => [COMMENT_CACHE_TAGS.POST_COMMENTS(postId)],
  },
} as const;

// 게시글 캐시 쿼리 함수들 - Next.js 15 최적화
export function createCachedPostsQuery(
  options: {
    published?: boolean;
    limit?: number;
    offset?: number;
    categoryId?: string;
    authorId?: string;
  } = {}
) {
  const { published, limit = 10, offset = 0, categoryId, authorId } = options;

  // 캐시 키 생성 (더 구체적인 키로 캐시 효율성 향상)
  const cacheKey = [
    "posts",
    published !== undefined ? `published-${published}` : "all",
    categoryId ? `category-${categoryId}` : "all-categories",
    authorId ? `author-${authorId}` : "all-authors",
    `limit-${limit}`,
    `offset-${offset}`,
  ];

  // 태그 설정 (더 세밀한 무효화 제어)
  const tags = [
    CACHE_TAGS.POSTS,
    published
      ? published
        ? CACHE_TAGS.POSTS_PUBLISHED
        : CACHE_TAGS.POSTS_DRAFT
      : CACHE_TAGS.POSTS,
    ...(categoryId ? [CACHE_TAGS.CATEGORY_POSTS(categoryId)] : []),
    ...(authorId ? [CACHE_TAGS.USER_POSTS(authorId)] : []),
  ];

  return unstable_cache(
    async () => {
      const where: any = {};
      if (published !== undefined) where.published = published;
      if (categoryId) where.categoryId = categoryId;
      if (authorId) where.authorId = authorId;

      return prisma.post.findMany({
        where,
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
    cacheKey,
    {
      revalidate: CACHE_CONFIG.POSTS.revalidate,
      tags,
    }
  );
}

export function createCachedPostQuery(postId: string) {
  return unstable_cache(
    async () => {
      const post = await prisma.post.findUnique({
        where: { id: postId },
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
          _count: {
            select: {
              comments: true,
            },
          },
        },
      });

      if (!post) return null;

      // 댓글은 별도 캐시로 관리 (성능 최적화)
      const comments = await prisma.comment.findMany({
        where: {
          postId,
          parentId: null, // 최상위 댓글만
        },
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
          _count: {
            select: {
              replies: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20, // 최적화를 위해 제한
      });

      return {
        ...post,
        comments,
      };
    },
    [`post-detail-${postId}`],
    {
      revalidate: CACHE_CONFIG.POST_DETAIL.revalidate,
      tags: CACHE_CONFIG.POST_DETAIL.tags(postId),
    }
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
    }
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
    }
  );
}

export function createCachedUsersQuery(
  options: { limit?: number; offset?: number } = {}
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
    }
  );
}
