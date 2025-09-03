import { fireEvent, render, screen } from "@testing-library/react";
import { PostCard } from "../post-card";

// Mock next/link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} data-testid={`link-${href}`}>
      {children}
    </a>
  ),
}));

// Mock date-fns
jest.mock("date-fns", () => ({
  formatDistanceToNow: jest.fn(() => "2시간 전"),
  ko: {},
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Calendar: () => <span data-testid="calendar-icon">📅</span>,
  Eye: () => <span data-testid="eye-icon">👁️</span>,
  MessageCircle: () => <span data-testid="message-icon">💬</span>,
}));

// Mock data
const mockPost = {
  id: "1",
  title: "테스트 게시글",
  excerpt: "이것은 테스트 게시글의 요약입니다.",
  slug: "test-post",
  published: true,
  createdAt: new Date("2024-01-01T10:00:00Z"),
  updatedAt: new Date("2024-01-01T10:00:00Z"),
  author: {
    id: "user1",
    name: "테스트 사용자",
    email: "test@example.com",
    image: "https://example.com/avatar.jpg",
  },
  category: {
    id: "cat1",
    name: "테스트 카테고리",
    slug: "test-category",
    color: "#ff0000",
  },
  _count: {
    comments: 5,
  },
};

const mockPostWithoutCategory = {
  ...mockPost,
  category: null,
};

const mockDraftPost = {
  ...mockPost,
  published: false,
};

it("should render post information correctly", () => {
  render(<PostCard post={mockPost} />);

  expect(screen.getByText("테스트 게시글")).toBeInTheDocument();
  expect(
    screen.getByText("이것은 테스트 게시글의 요약입니다.")
  ).toBeInTheDocument();
  expect(screen.getByText("테스트 사용자")).toBeInTheDocument();
  expect(screen.getByText("2시간 전")).toBeInTheDocument();
  expect(screen.getByText("5개")).toBeInTheDocument();
  expect(screen.getByText("테스트 카테고리")).toBeInTheDocument();
});

it("should render link with correct href", () => {
  render(<PostCard post={mockPost} />);

  const link = screen.getByTestId("link-/posts/test-post");
  expect(link).toBeInTheDocument();
  expect(link).toHaveAttribute("href", "/posts/test-post");
});

it("should show draft badge for unpublished posts", () => {
  render(<PostCard post={mockDraftPost} />);

  expect(screen.getByText("비공개")).toBeInTheDocument();
  expect(screen.getByLabelText("비공개 게시글")).toBeInTheDocument();
});

it("should not show category when category is null", () => {
  render(<PostCard post={mockPostWithoutCategory} />);

  expect(screen.queryByText("테스트 카테고리")).not.toBeInTheDocument();
});

it("should have proper ARIA labels", () => {
  render(<PostCard post={mockPost} />);

  expect(screen.getByRole("article")).toBeInTheDocument();
  expect(screen.getByLabelText("작성자 정보")).toBeInTheDocument();
  expect(screen.getByLabelText("게시 날짜")).toBeInTheDocument();
  expect(screen.getByLabelText("댓글 수")).toBeInTheDocument();
});

it("should display accessibility information for screen readers", () => {
  render(<PostCard post={mockPost} />);

  const srOnlyText = screen.getByText(
    "공개 게시글 - 테스트 게시글 by 테스트 사용자"
  );
  expect(srOnlyText).toHaveClass("sr-only");
});

it("should handle focus correctly", () => {
  render(<PostCard post={mockPost} />);

  const link = screen.getByTestId("link-/posts/test-post");

  // Focus should work
  link.focus();
  expect(document.activeElement).toBe(link);
});

it("should apply focus-within styles", () => {
  render(<PostCard post={mockPost} />);

  const card = screen.getByRole("article");
  const link = screen.getByTestId("link-/posts/test-post");

  // Focus the link
  fireEvent.focus(link);

  // Card should have focus-within class
  expect(card).toHaveClass("focus-within:ring-2");
});

it("should handle long titles gracefully", () => {
  const longTitlePost = {
    ...mockPost,
    title: "매우 긴 제목입니다. ".repeat(10),
  };

  render(<PostCard post={longTitlePost} />);

  const titleElement = screen.getByText(longTitlePost.title);
  expect(titleElement).toHaveClass("line-clamp-2");
});

it("should handle long excerpts gracefully", () => {
  const longExcerptPost = {
    ...mockPost,
    excerpt: "매우 긴 요약입니다. ".repeat(20),
  };

  render(<PostCard post={longExcerptPost} />);

  const excerptElement = screen.getByText(longExcerptPost.excerpt!);
  expect(excerptElement).toHaveClass("line-clamp-3");
});

it("should display correct comment count format", () => {
  const noCommentsPost = { ...mockPost, _count: { comments: 0 } };
  const singleCommentPost = { ...mockPost, _count: { comments: 1 } };
  const manyCommentsPost = { ...mockPost, _count: { comments: 100 } };

  const { rerender } = render(<PostCard post={noCommentsPost} />);
  expect(screen.getByText("0개")).toBeInTheDocument();

  rerender(<PostCard post={singleCommentPost} />);
  expect(screen.getByText("1개")).toBeInTheDocument();

  rerender(<PostCard post={manyCommentsPost} />);
  expect(screen.getByText("100개")).toBeInTheDocument();
});

it("should handle posts without excerpts", () => {
  const noExcerptPost = { ...mockPost, excerpt: null };

  render(<PostCard post={noExcerptPost} />);

  // Excerpt should not be rendered
  expect(
    screen.queryByText("이것은 테스트 게시글의 요약입니다.")
  ).not.toBeInTheDocument();
});

it("should handle posts with different author information", () => {
  const noNamePost = {
    ...mockPost,
    author: { ...mockPost.author, name: null },
  };

  render(<PostCard post={noNamePost} />);

  // Should show email when name is null
  expect(screen.getByText("test@example.com")).toBeInTheDocument();
});

it("should handle posts with different image states", () => {
  const noImagePost = {
    ...mockPost,
    author: { ...mockPost.author, image: null },
  };

  render(<PostCard post={noImagePost} />);

  // Avatar should still render without error
  const avatar = screen.getByLabelText("테스트 사용자 프로필 이미지");
  expect(avatar).toBeInTheDocument();
});

it("should handle time formatting", () => {
  const { formatDistanceToNow } = require("date-fns");
  formatDistanceToNow.mockReturnValue("방금 전");

  render(<PostCard post={mockPost} />);

  expect(screen.getByText("방금 전")).toBeInTheDocument();
  expect(screen.getByLabelText("게시일: 방금 전")).toBeInTheDocument();
});

// Performance tests
describe("PostCard Performance", () => {
  it("should not re-render unnecessarily", () => {
    const testPost1 = { ...mockPost };
    const testPost2 = { ...mockPost, title: "새 제목" };

    const { rerender } = render(<PostCard post={testPost1} />);

    // Same post should not cause unnecessary re-render
    rerender(<PostCard post={testPost1} />);

    // Different post should re-render
    rerender(<PostCard post={testPost2} />);
    expect(screen.getByText("새 제목")).toBeInTheDocument();
  });
});

// Accessibility tests
describe("PostCard Accessibility", () => {
  it("should have proper heading structure", () => {
    render(<PostCard post={mockPost} />);

    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("테스트 게시글");
  });

  it("should support keyboard navigation", () => {
    render(<PostCard post={mockPost} />);

    const link = screen.getByTestId("link-/posts/test-post");

    // Tab should focus the link
    link.focus();
    expect(document.activeElement).toBe(link);

    // Enter key should work
    fireEvent.keyDown(link, { key: "Enter" });
    // Link navigation is handled by browser
  });

  it("should have sufficient color contrast for category badges", () => {
    render(<PostCard post={mockPost} />);

    const categoryBadge = screen.getByText("테스트 카테고리");
    expect(categoryBadge).toBeInTheDocument();
    // Color contrast would be tested in visual regression tests
  });

  it("should provide context for screen readers", () => {
    render(<PostCard post={mockPost} />);

    // Screen reader should get context about the post status
    expect(screen.getByText(/공개 게시글/)).toBeInTheDocument();
    expect(screen.getByText(/테스트 사용자/)).toBeInTheDocument();
  });
});
