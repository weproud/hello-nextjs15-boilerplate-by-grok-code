import { handlers } from "@/lib/auth";

// 실제 OAuth 키가 설정되어 있는지 확인
const hasValidOAuthKeys = () => {
  const googleId = process.env.AUTH_GOOGLE_ID;
  const googleSecret = process.env.AUTH_GOOGLE_SECRET;
  const kakaoId = process.env.AUTH_KAKAO_ID;
  const kakaoSecret = process.env.AUTH_KAKAO_SECRET;

  // 더미 값이 아닌 실제 값인지 확인
  return (
    googleId &&
    googleId !== "dummy-google-client-id" &&
    googleSecret &&
    googleSecret !== "dummy-google-client-secret" &&
    kakaoId &&
    kakaoId !== "dummy-kakao-client-id" &&
    kakaoSecret &&
    kakaoSecret !== "dummy-kakao-client-secret"
  );
};

export const { GET, POST } = handlers;
