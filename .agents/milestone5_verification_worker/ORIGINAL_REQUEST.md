## 2026-07-11T14:12:55Z
You are the Milestone 5 Final Verification Worker. Your task is:
1. Read the handoff reports from previous milestones (e.g. `.agents/milestone4_backport_worker/handoff.md` and `PROJECT.md`).
2. Verify compilation and test suite status:
   - Run `npm run type-check` in both workspaces.
   - Run `npm run test` in both workspaces.
3. Run the closure gate check and seal command:
   - Run `npm run done` in the workspace root.
4. Capture the final GSEAL code from the command's stdout.
5. Update `walkthrough.md` with the new GSEAL code and a summary of the finalized refactoring work.
6. Write your progress.md and a final handoff.md summarizing all verification results and the GSEAL code.
7. MANDATORY INTEGRITY WARNING: DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task.
