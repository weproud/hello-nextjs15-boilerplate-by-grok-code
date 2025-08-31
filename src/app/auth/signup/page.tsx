import { redirect } from "next/navigation";

export default function SignUpPage() {
  // 회원가입 기능이 제거되었으므로 로그인 페이지로 리다이렉트
  redirect("/auth/signin");
}
