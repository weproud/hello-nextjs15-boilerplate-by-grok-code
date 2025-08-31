import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

export const actionClient = createSafeActionClient({
  // Define logging middleware
  defineMetadataSchema() {
    return z.object({
      actionName: z.string(),
    });
  },
  handleServerError(e) {
    console.error("Action error:", e);
    if (e instanceof Error) {
      return e.message;
    }
    return "서버 오류가 발생했습니다";
  },
});
