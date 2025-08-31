import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  // 기본 페이지들
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/posts`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  try {
    // 게시글 데이터 가져오기
    const posts = await prisma.post.findMany({
      where: {
        published: true, // 공개된 게시글만 포함
      },
      select: {
        slug: true,
        updatedAt: true,
        category: {
          select: {
            slug: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // 게시글 페이지들 추가
    const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${baseUrl}/posts/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // 카테고리 페이지들 추가
    const categories = await prisma.category.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${baseUrl}/posts?category=${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticPages, ...postPages, ...categoryPages];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // 에러 발생 시 기본 페이지만 반환
    return staticPages;
  }
}
