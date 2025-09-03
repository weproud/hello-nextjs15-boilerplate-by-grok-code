import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await auth();

  // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
  if (!session?.user) {
    redirect("/auth/signin");
  }

  return <DashboardClient user={session.user} />;
}
