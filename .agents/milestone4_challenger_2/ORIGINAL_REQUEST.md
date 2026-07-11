## 2026-07-11T05:37:51+09:00 (Local Time)
You are Milestone 4 Challenger 2. Your task is:
1. Conduct empirical verification and stress testing of the Milestone 4 refactoring.
2. Specifically, verify that `useDataSync.ts` handles:
   - Cache bypass logic correctly.
   - Offline-first merging/upgrades and error boundary handling.
   - Realtime channel updates and unsubscribes cleanly.
3. Run `npm run test` and any integration/stress tests in the workspace to confirm runtime stability.
4. Report your empirical verification results and confirm correctness in your handoff.md.

## 2026-07-11T09:00:13Z (UTC Time, Resuming Message)
**Context**: Resuming Milestone 4 verification after server restart.
**Content**: The server was restarted, stopping all active tasks. The implementation in `apps/repaper-route/src/features/board/hooks/useDataSync.ts` has been completed.
**Action**: Please resume your verification task. Verify that TypeScript compilation (`npm run type-check`) compiles with zero errors, and all vitest unit/stress tests pass (`npm run test`). Write your report/handoff and report back when finished.
