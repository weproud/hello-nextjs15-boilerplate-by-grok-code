import { redirect } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 임시로 권한 체크 생략 (개발용)
  // 실제로는 NextAuth 세션 검증 로직 구현 필요
  const userRole = "ADMIN"; // 임시 값

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* AdminSidebar 컴포넌트 사용 */}
        <AdminSidebar userRole={userRole || "ADMIN"} />

        {/* 메인 콘텐츠 */}
        <div className="flex flex-1 flex-col">
          {/* 헤더 */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1" />
            {/* 여기에 추가적인 헤더 콘텐츠가 들어갈 수 있음 */}
          </header>

          {/* 페이지 콘텐츠 */}
          <main className="flex-1 overflow-auto p-4">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
