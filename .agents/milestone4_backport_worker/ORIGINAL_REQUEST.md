## 2026-07-11T14:07:50Z
You are the Milestone 4 Backport Worker. Your task is:
1. Backport all of the robust fixes made to TBNY DXOS's `useDataSync.ts` (`src/features/repaper-route/board/hooks/useDataSync.ts`) to RePaper Route's `useDataSync.ts` (`apps/repaper-route/src/features/board/hooks/useDataSync.ts`).
2. The backport changes should include:
   - All `any` type refactorings to strict types (`unknown` and safe `Record<string, unknown>` casting).
   - Race-condition mitigation using `activeDateRef` tracking.
   - Safe mapping for `jobs` and `pendingJobs` to handle corrupt null/undefined records without halting the entire loading process.
   - Plain error formatting / translation inside hook catch blocks.
3. Clean up the unused variable `col` on line 139 of `apps/repaper-route/src/features/board/hooks/useDataSync.test.tsx` to resolve the compiler error.
4. Run `npm run type-check` and `npm run test` in the workspace to verify that everything compiles and passes cleanly in both codebases.
5. MANDATORY INTEGRITY WARNING: DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task.
6. Write your progress.md and a final handoff.md summarizing all changes and testing results.
