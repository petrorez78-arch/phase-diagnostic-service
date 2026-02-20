import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { sendToN8N, parseN8NResponse } from "./n8nProxy";
import { addChatMessage, getChatHistory, getUserChatSessions, upsertChatSession, deleteChatSession, getPhaseContext } from "./db";

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

  // Chat router - persistent chat history
  chat: router({    // Get user's chat sessions
    sessions: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      return await getUserChatSessions(ctx.user.id);
    }),

    // Get chat history for a specific session
    history: publicProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "chatId" in val) {
          return { chatId: String((val as any).chatId) };
        }
        throw new Error("Invalid input: chatId is required");
      })
      .query(async ({ input }) => {
        return await getChatHistory(input.chatId);
      }),

    // Upsert chat session
    upsertSession: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null) {
          const obj = val as any;
          return {
            chatId: String(obj.chatId),
            title: String(obj.title),
            lastMessage: obj.lastMessage ? String(obj.lastMessage) : undefined,
          };
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        await upsertChatSession({
          userId: ctx.user.id,
          chatId: input.chatId,
          title: input.title,
          lastMessage: input.lastMessage,
        });
        return { success: true };
      }),

    // Delete chat session
    deleteSession: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "chatId" in val) {
          return { chatId: String((val as any).chatId) };
        }
        throw new Error("Invalid input: chatId is required");
      })
      .mutation(async ({ input }) => {
        await deleteChatSession(input.chatId);
        return { success: true };
      }),

    // Save a chat message
    saveMessage: publicProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null) {
          const obj = val as any;
          return {
            userId: Number(obj.userId || 0),
            chatId: String(obj.chatId),
            ticker: String(obj.ticker || "unknown"),
            role: String(obj.role) as "user" | "assistant",
            content: String(obj.content),
          };
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input }) => {
        await addChatMessage(input);
        return { success: true };
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
            history: Array.isArray(obj.history) ? obj.history : [],
          };
        }
        throw new Error("Invalid input: message is required");
      })
      .mutation(async ({ input, ctx }) => {
        try {
          // Save user message if user is authenticated
          if (ctx.user) {
            await addChatMessage({
              userId: ctx.user.id,
              chatId: input.chatId,
              ticker: "unknown", // Will be updated when we parse response
              role: "user",
              content: input.message,
            });
          }

          // Load previous phase context for follow-up questions
          const phaseContext = await getPhaseContext(input.chatId);

          const response = await sendToN8N({
            message: input.message,
            chatId: input.chatId,
            history: input.history,
            phaseContext: phaseContext ? {
              ticker: phaseContext.ticker,
              company: phaseContext.company,
              phase: phaseContext.phase,
              indices: {
                s: phaseContext.s,
                vS: phaseContext.vS,
                aS: phaseContext.aS,
                iFund: phaseContext.iFund,
                iMarketGap: phaseContext.iMarketGap,
                iStruct: phaseContext.iStruct,
                iVola: phaseContext.iVola,
              },
              signals: phaseContext.signals ? JSON.parse(phaseContext.signals) : [],
            } : undefined,
          });

          if (!response.success) {
            return {
              success: false,
              error: response.error,
            };
          }

          // Parse the response to extract structured data
          const parsed = parseN8NResponse(response.data);

          // Save assistant message if user is authenticated
          if (ctx.user) {
            await addChatMessage({
              userId: ctx.user.id,
              chatId: input.chatId,
              ticker: "unknown",
              role: "assistant",
              content: typeof parsed === "string" ? parsed : JSON.stringify(parsed),
            });
          }

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
