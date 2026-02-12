import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { sendToN8N, parseN8NResponse } from "./n8nProxy";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Stock diagnostics router - proxies to n8n
  diagnostics: router({
    // Send message to n8n (search, analysis, or chat)
    send: publicProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "message" in val) {
          const obj = val as any;
          return {
            message: String(obj.message),
            chatId: String(obj.chatId || `chat-${Date.now()}`),
          };
        }
        throw new Error("Invalid input: message is required");
      })
      .mutation(async ({ input }) => {
        try {
          const response = await sendToN8N({
            message: input.message,
            chatId: input.chatId,
          });

          if (!response.success) {
            return {
              success: false,
              error: response.error,
            };
          }

          // Parse the response to extract structured data
          const parsed = parseN8NResponse(response.data);

          return {
            success: true,
            type: parsed.type,
            data: parsed,
          };
        } catch (error) {
          console.error("Diagnostics send error:", error);
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
