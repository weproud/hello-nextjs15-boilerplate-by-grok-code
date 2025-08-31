"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface SignUpProps {
  isModal?: boolean;
}

export default function SignUp({ isModal = true }: SignUpProps) {
  const router = useRouter();

  useEffect(() => {
    // 회원가입 기능이 제거되었으므로 로그인 페이지로 리다이렉트
    if (isModal) {
      router.replace("/auth/signin");
    } else {
      router.replace("/auth/signin");
    }
  }, [isModal, router]);

  return null;
}
