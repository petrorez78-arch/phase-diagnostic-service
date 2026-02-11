import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
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

  // Stock diagnostics router
  diagnostics: router({
    search: publicProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "query" in val) {
          return { query: String((val as any).query) };
        }
        throw new Error("Invalid input");
      })
      .query(async ({ input }) => {
        const { searchSecurities } = await import("./moex");
        const results = await searchSecurities(input.query);
        return results;
      }),

    analyze: publicProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "ticker" in val) {
          const obj = val as any;
          return {
            ticker: String(obj.ticker),
            company: String(obj.company || obj.ticker),
            chatId: String(obj.chatId || "default"),
          };
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input, ctx }) => {
        const { getMarketData, getHistoryData } = await import("./moex");
        const { computePhaseDiagnostics } = await import(
          "./phaseDiagnostics"
        );
        const { getNewsAndSentiment } = await import("./smartlab");

        // Fetch market data
        const marketData = await getMarketData(input.ticker);
        if (!marketData) {
          throw new Error("Failed to fetch market data");
        }

        // Fetch history
        const history = await getHistoryData(input.ticker);
        if (history.length === 0) {
          throw new Error("No historical data available");
        }

        // Compute diagnostics
        const diagnostics = computePhaseDiagnostics(
          history.map((h) => ({
            close: h.close,
            volume: h.volume,
            date: h.tradeDate,
          })),
          marketData.lastPrice / 100 // Convert from kopecks
        );

        // Fetch news
        const newsData = await getNewsAndSentiment(input.ticker) || { news: [], rhetoricalPressure: 0 };

        // Store in database if user is authenticated
        if (ctx.user) {
          const {
            upsertPhaseContext,
            saveDiagnosticSnapshot,
          } = await import("./db");

          await upsertPhaseContext({
            userId: ctx.user.id,
            chatId: input.chatId,
            ticker: input.ticker,
            company: input.company,
            phase: diagnostics.phase,
            s: diagnostics.s,
            vS: diagnostics.vS,
            aS: diagnostics.aS,
            iFund: diagnostics.iFund,
            iMarketGap: diagnostics.iMarketGap,
            iStruct: diagnostics.iStruct,
            iVola: diagnostics.iVola,
            signals: diagnostics.signals,
            lastPrice: marketData.lastPrice,
            volToday: marketData.volToday,
            numTrades: marketData.numTrades,
            capitalization: marketData.capitalization,
          });

          await saveDiagnosticSnapshot({
            userId: ctx.user.id,
            ticker: input.ticker,
            company: input.company,
            phase: diagnostics.phase,
            s: diagnostics.s,
            vS: diagnostics.vS,
            aS: diagnostics.aS,
            iFund: diagnostics.iFund,
            iMarketGap: diagnostics.iMarketGap,
            iStruct: diagnostics.iStruct,
            iVola: diagnostics.iVola,
            signals: diagnostics.signals,
            lastPrice: marketData.lastPrice,
            volToday: marketData.volToday,
            numTrades: marketData.numTrades,
            capitalization: marketData.capitalization,
            newsContext: newsData,
          });
        }

        return {
          ticker: input.ticker,
          company: input.company,
          marketData,
          diagnostics,
          newsData,
        };
      }),

    chat: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "message" in val) {
          const obj = val as any;
          return {
            message: String(obj.message),
            ticker: String(obj.ticker),
            chatId: String(obj.chatId),
          };
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input, ctx }) => {
        const { addChatMessage, getChatHistory } = await import("./db");
        const { invokeLLM } = await import("./_core/llm");

        // Save user message
        await addChatMessage({
          userId: ctx.user.id,
          chatId: input.chatId,
          ticker: input.ticker,
          role: "user",
          content: input.message,
        });

        // Get chat history for context
        const history = await getChatHistory(input.chatId, 10);

        // Prepare messages for LLM
        const messages: Array<{ role: string; content: string }> = [
          {
            role: "system",
            content: `Ты аналитический агент фазовой диагностики компаний. Ты отвечаешь на русском языке. Твоя задача - объяснять результаты фазовой диагностики акций, анализировать индексы и давать инвестиционные рекомендации на основе данных.`,
          },
          ...history.map((h) => ({
            role: h.role,
            content: h.content,
          })),
          {
            role: "user",
            content: input.message,
          },
        ];

        // Call LLM
        const response = await invokeLLM({
          messages: messages as any,
        });

        const content = response.choices[0]?.message?.content as string | undefined;
        const assistantMessage =
          typeof content === "string"
            ? content
            : "Извините, произошла ошибка.";

        // Save assistant response
        await addChatMessage({
          userId: ctx.user.id,
          chatId: input.chatId,
          ticker: input.ticker,
          role: "assistant",
          content: assistantMessage,
        });

        return {
          message: assistantMessage,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
