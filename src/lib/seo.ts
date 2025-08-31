import type { Metadata } from "next";

// 기본 메타데이터 설정
export const defaultMetadata: Metadata = {
  title: {
    default: "WeProud",
    template: "%s | WeProud",
  },
  description:
    "현대적인 Next.js 애플리케이션으로, 최고의 사용자 경험을 제공합니다.",
  keywords: ["Next.js", "React", "TypeScript", "Tailwind CSS", "SaaS"],
  authors: [{ name: "WeProud Team" }],
  creator: "WeProud",
  publisher: "WeProud",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://weproud.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://weproud.vercel.app",
    title: "WeProud",
    description:
      "현대적인 Next.js 애플리케이션으로, 최고의 사용자 경험을 제공합니다.",
    siteName: "WeProud",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "WeProud",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WeProud",
    description:
      "현대적인 Next.js 애플리케이션으로, 최고의 사용자 경험을 제공합니다.",
    images: ["/og-image.jpg"],
    creator: "@weproud",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-site-verification",
    yandex: "your-yandex-verification",
    bing: "your-bing-verification",
  },
};

// 페이지별 메타데이터 생성 헬퍼 함수들
export function createPageMetadata(
  title: string,
  description: string,
  options?: {
    keywords?: string[];
    image?: string;
    url?: string;
    type?: "website" | "article" | "profile";
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  },
): Metadata {
  const {
    keywords = [],
    image = "/og-image.jpg",
    url,
    type = "website",
    publishedTime,
    modifiedTime,
    author,
    section,
    tags,
  } = options || {};

  return {
    title,
    description,
    keywords: [...(defaultMetadata.keywords || []), ...keywords],
    openGraph: {
      ...defaultMetadata.openGraph,
      title,
      description,
      url,
      type,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      article:
        type === "article"
          ? {
              publishedTime,
              modifiedTime,
              author,
              section,
              tags,
            }
          : undefined,
    },
    twitter: {
      ...defaultMetadata.twitter,
      title,
      description,
      images: [image],
    },
  };
}

// JSON-LD 구조화 데이터 생성 헬퍼
export function createJsonLd(
  type: "WebSite" | "Article" | "Person",
  data: Record<string, string | number | boolean | null | undefined>,
) {
  const baseData = {
    "@context": "https://schema.org",
    "@type": type,
    name: "WeProud",
    url: "https://weproud.vercel.app",
    ...data,
  };

  return baseData;
}

// Breadcrumb 구조화 데이터
export function createBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Article 구조화 데이터
export function createArticleJsonLd(article: {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified: string;
  author: {
    name: string;
    url?: string;
  };
  publisher: {
    name: string;
    logo: string;
  };
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.headline,
    description: article.description,
    image: article.image,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    author: {
      "@type": "Person",
      name: article.author.name,
      url: article.author.url,
    },
    publisher: {
      "@type": "Organization",
      name: article.publisher.name,
      logo: {
        "@type": "ImageObject",
        url: article.publisher.logo,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": article.url,
    },
  };
}

// SEO 최적화된 URL 생성
export function createCanonicalUrl(
  path: string,
  params?: Record<string, string>,
) {
  const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
  const url = new URL(path, baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return url.toString();
}

// 메타 태그 생성 헬퍼 (클라이언트 사이드용)
export function createMetaTags(metadata: Partial<Metadata>) {
  const tags: Array<{ name?: string; property?: string; content: string }> = [];

  if (metadata.description) {
    tags.push({
      name: "description",
      content:
        typeof metadata.description === "string" ? metadata.description : "",
    });
  }

  if (metadata.keywords) {
    tags.push({
      name: "keywords",
      content: Array.isArray(metadata.keywords)
        ? metadata.keywords.join(", ")
        : metadata.keywords,
    });
  }

  // Open Graph tags
  if (metadata.openGraph) {
    const og = metadata.openGraph;
    if (og.title) {
      tags.push({ property: "og:title", content: og.title });
    }
    if (og.description) {
      tags.push({ property: "og:description", content: og.description });
    }
    if (og.type) {
      tags.push({ property: "og:type", content: og.type });
    }
    if (og.url) {
      tags.push({ property: "og:url", content: og.url });
    }
    if (og.images && Array.isArray(og.images) && og.images[0]) {
      tags.push({ property: "og:image", content: og.images[0].url });
    }
  }

  // Twitter Card tags
  if (metadata.twitter) {
    const twitter = metadata.twitter;
    if (twitter.card) {
      tags.push({ name: "twitter:card", content: twitter.card });
    }
    if (twitter.title) {
      tags.push({ name: "twitter:title", content: twitter.title });
    }
    if (twitter.description) {
      tags.push({ name: "twitter:description", content: twitter.description });
    }
    if (twitter.images && Array.isArray(twitter.images) && twitter.images[0]) {
      tags.push({ name: "twitter:image", content: twitter.images[0] });
    }
  }

  return tags;
}
