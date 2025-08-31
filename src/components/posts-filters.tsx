"use client";

import { Filter, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PostsFiltersProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export function PostsFilters({ searchParams }: PostsFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(() => {
      const search = formData.get("search") as string;
      const category = formData.get("category") as string;

      const params = new URLSearchParams();

      if (search) params.set("search", search);
      if (category && category !== "all") params.set("category", category);

      router.push(`/posts?${params.toString()}`);
    });
  };

  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <form action={handleSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="게시글 검색..."
                className="pl-10"
                name="search"
                defaultValue={searchParams.search as string}
                disabled={isPending}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select
              name="category"
              defaultValue={(searchParams.category as string) || "all"}
              disabled={isPending}
            >
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="tech">기술</SelectItem>
                <SelectItem value="design">디자인</SelectItem>
                <SelectItem value="business">비즈니스</SelectItem>
                <SelectItem value="lifestyle">라이프스타일</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" variant="outline" disabled={isPending}>
              {isPending ? "검색 중..." : "검색"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
