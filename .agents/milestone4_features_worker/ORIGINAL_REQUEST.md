## 2026-07-11T05:32:26Z
You are the Milestone 4 Features Worker. Your task is:
1. Locate `src/features/repaper-route/board/hooks/useDataSync.ts` in the workspace.
2. Refactor all `any` types in `useDataSync.ts` to strict types:
   - Line 72 & 73: `(j: any)` -> `(j: unknown)` (cast to appropriate record or handle safely).
   - Line 107: `(p as any).duration_minutes` -> access duration_minutes using a safe cast like `(p as Record<string, unknown>).duration_minutes as number | undefined`.
   - Line 122: `(routesRes.data as any[])` -> cast to `Record<string, unknown>[]` or check type properly.
   - Line 137 & 138: `(j: any)` -> `(j: unknown)`.
   - Line 169: `(routeData.drivers as any[])` -> cast to `Record<string, unknown>[]` or `BoardDriver[]`.
   - Line 198: `(err: any)` -> `(err: unknown)` and update error handling to `setError(err instanceof Error ? err.message : String(err))`.
3. Run `npm run type-check` and `npm run test` in the workspace to verify compilation and unit tests.
4. MANDATORY INTEGRITY WARNING: DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task.
5. Write your progress.md and a final handoff.md summarizing all changes and testing results.
