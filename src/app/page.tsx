import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { HomeClient } from "./home-client";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    // 이미 로그인된 사용자는 대시보드로 리다이렉트
    redirect("/dashboard");
  }

  // 로그인되지 않은 사용자에게 로그인 옵션 표시
  return <HomeClient />;
}
