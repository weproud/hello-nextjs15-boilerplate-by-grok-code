"use client";

import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map as MapIcon,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "사용자",
    email: "user@example.com",
    avatar: "/avatars/user.jpg",
  },
  navMain: [
    {
      title: "플랫폼",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "홈",
          url: "/",
        },
        {
          title: "게시글",
          url: "/posts",
        },
        {
          title: "새 글 작성",
          url: "/posts/create",
        },
      ],
    },
    {
      title: "콘텐츠",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "최근 게시글",
          url: "/posts?filter=recent",
        },
        {
          title: "인기 게시글",
          url: "/posts?filter=popular",
        },
        {
          title: "내 게시글",
          url: "/posts?filter=my",
        },
      ],
    },
    {
      title: "관리",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "통계",
          url: "/analytics",
        },
        {
          title: "사용자 관리",
          url: "/admin/users",
        },
        {
          title: "시스템 설정",
          url: "/admin/settings",
        },
      ],
    },
    {
      title: "설정",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "프로필 설정",
          url: "/me",
        },
        {
          title: "알림 설정",
          url: "/settings/notifications",
        },
        {
          title: "계정 설정",
          url: "/settings/account",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "도움말",
      url: "/help",
      icon: LifeBuoy,
    },
    {
      title: "피드백",
      url: "/feedback",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "개인 블로그",
      url: "/projects/personal-blog",
      icon: Frame,
    },
    {
      name: "팀 프로젝트",
      url: "/projects/team-project",
      icon: PieChart,
    },
    {
      name: "포트폴리오",
      url: "/projects/portfolio",
      icon: MapIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">WeProud</span>
                  <span className="truncate text-xs">커뮤니티</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
