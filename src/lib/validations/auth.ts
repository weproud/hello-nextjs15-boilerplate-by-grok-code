import { z } from "zod";

// Social Auth 관련 스키마들
export const socialAuthSchema = z.object({
  provider: z.enum(["google", "kakao"]),
});

// 프로필 업데이트 스키마 (소셜 로그인 사용자용)
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, "이름을 입력해주세요")
    .max(50, "이름은 50자 이하여야 합니다"),
  bio: z.string().max(500, "자기소개는 500자 이하여야 합니다").optional(),
  website: z
    .string()
    .url("유효한 URL 형식이 아닙니다")
    .optional()
    .or(z.literal("")),
});

// 알림 설정 스키마
export const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  postNotifications: z.boolean().default(true),
  commentNotifications: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
});

export type SocialAuthFormData = z.infer<typeof socialAuthSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type NotificationSettingsFormData = z.infer<
  typeof notificationSettingsSchema
>;
