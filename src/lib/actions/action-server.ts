import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { auth } from "../auth";

export const actionClient = createSafeActionClient({
  defineMetadataSchema() {
    return z.object({
      actionName: z.string(),
    });
  },
  handleServerError(e) {
    console.error("Action error:", e.message);
    return e.message;
  },
}).use(async ({ next }) => {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized");
  }

  return next({
    ctx: {
      userId: session.user.id,
      user: session.user,
    },
  });
});
