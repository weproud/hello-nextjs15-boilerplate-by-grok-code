import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostDetail } from "@/components/post-detail";
import { getCachedPost } from "@/lib/actions/post-actions";
import { createPageMetadata } from "@/lib/seo";
import { prisma } from "@/lib/prisma";

// ISR 설정: 게시글은 10분마다 재생성
export const revalidate = 600; // 10분

// 게시글 데이터 가져오기 (새로운 캐싱 패턴 적용)
async function getPost(slug: string) {
  // 먼저 slug로 ID를 찾은 후 캐시된 데이터를 조회
  const postBasic = await prisma.post.findUnique({
    where: { slug },
    select: { id: true, published: true },
  });

  if (!postBasic || !postBasic.published) {
    return null;
  }

  // 캐시된 데이터 조회 함수 사용 (ID로 조회)
  return getCachedPost(postBasic.id)();
}

// 메타데이터 생성
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return createPageMetadata(
      "게시글을 찾을 수 없습니다",
      "요청하신 게시글을 찾을 수 없습니다. 다른 게시글을 확인해보세요.",
      {
        type: "website",
      }
    );
  }

  const description =
    post.excerpt || post.content.replace(/<[^>]*>/g, "").slice(0, 160) + "...";

  const keywords = [
    "블로그",
    "게시글",
    post.category?.name,
    post.author.name || "작성자",
  ].filter((item): item is string => Boolean(item));

  const tags = post.category?.name ? [post.category.name] : [];

  return createPageMetadata(post.title, description, {
    keywords,
    type: "article",
    publishedTime: post.createdAt.toISOString(),
    modifiedTime: post.updatedAt.toISOString(),
    author: post.author.name || post.author.email,
    section: post.category?.name,
    tags,
    url: `/posts/${post.slug}`,
  });
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return <PostDetail post={post} />;
}
