import { render, screen } from "@testing-library/react";
import { Skeleton } from "../skeleton";
import { CardSkeleton } from "../skeleton-loader";

describe("Skeleton Components", () => {
  it("should render skeleton with default styles", () => {
    render(<Skeleton data-testid="skeleton" />);

    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass("bg-accent", "animate-pulse", "rounded-md");
  });

  it("should render skeleton with custom className", () => {
    render(<Skeleton className="custom-class" data-testid="skeleton" />);

    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toHaveClass("custom-class");
  });

  it("should render CardSkeleton with proper structure", () => {
    render(<CardSkeleton data-testid="card-skeleton" />);

    const cardSkeleton = screen.getByTestId("card-skeleton");
    expect(cardSkeleton).toBeInTheDocument();
    expect(cardSkeleton).toHaveClass("rounded-lg", "border", "p-6", "space-y-4");

    // Check for skeleton elements inside
    const skeletons = cardSkeleton.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
