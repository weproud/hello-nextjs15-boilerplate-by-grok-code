"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignUp() {
  const router = useRouter();

  useEffect(() => {
    // 회원가입 기능이 제거되었으므로 로그인 페이지로 리다이렉트
    router.replace("/auth/signin");
  }, [router]);

  return null;
}
