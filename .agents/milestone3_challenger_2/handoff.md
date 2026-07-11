# Handoff Report — Milestone 3 Challenger 2

- **Role**: Empirical Challenger (critic, specialist)
- **Last visited**: 2026-07-11T05:28:50+09:00

---

## 1. Observation

I directly verified the refactored code and ran the test suite in the workspace. Below are the key findings:

1. **Timeout Promise Verification**:
   - In `src/features/contexts/AuthContext.tsx`, timeout promises (`staffTimeout` and `timeout`) are raced against the main operation using `Promise.race`. A `finally` block is correctly implemented to call `clearTimeout(timeoutId)`.
   - In `src/features/components/LoginGate.tsx` (lines 21-26), a 10-second timeout promise is raced without a clearing mechanism:
     ```typescript
     const timeout = new Promise<never>((_, reject) => 
       setTimeout(() => reject(new Error('AUTH_TIMEOUT')), 10000)
     );
     const loginTask = AuthAdapter.signInWithPassword(email, password);
     const result = await Promise.race([loginTask, timeout]);
     ```
2. **Error Formatting & PostgrestError**:
   - `src/features/hooks/useMasterCRUD.ts` (lines 15-26) defines `toError` to format standard errors and objects containing `code`, `details`, and `hint`.
3. **Syllabary Filters & LookupSelect**:
   - `src/features/repaper-route/components/MasterDataLayout.tsx` (lines 143-172) filters data by initial characters utilizing group regexes (`あ`, `か`, `さ`, `た`, `な`, `は`, `ま`, `や`, `ら`, `わ` and `他`).
   - `LookupSelect` (lines 1025-1056) uses `useMasterCRUD` and SWR to render options dynamically.
4. **Command Execution Results**:
   - `npm run type-check`: Passed successfully without errors.
   - `npm run test` (executing all tests, including our modified `milestone3_verification.test.tsx`):
     ```
     Test Files  8 passed | 1 skipped (9)
          Tests  55 passed | 1 skipped (56)
       Start at  05:28:27
       Duration  1.69s
     ```

---

## 2. Logic Chain

1. **Timeout Promise Leakage Fixes**:
   - The test `should settle and call clearTimeout when main promise resolves before timeout` in `milestone3_verification.test.tsx` confirms that when the database fetch resolves, `clearTimeout` is called, ensuring no memory leaks.
   - The new test `should settle and call clearTimeout when main promise rejects before timeout` confirms that `clearTimeout` is invoked even if the database promise rejects.
   - The verification test `should demonstrate that LoginGate-style timeout leaks timeout if not cleared` confirms that in `LoginGate.tsx`, the `setTimeout` remains active after a successful login task resolves, causing a timer leak on the event loop.
2. **Error Formatting**:
   - The tests `should format standard Error properly`, `should format PostgrestError objects with code, details, and hint`, and `should translate DXOS_VAL_01, DXOS_VAL_02, and DXOS_AUTH_01 errors` confirm that useMasterCRUD parses standard and PostgrestError shapes correctly and translates them into appropriate Japanese error messages.
3. **Syllabary Filters & LookupSelect**:
   - The test `should correctly match hiragana, full-width katakana, and half-width katakana` and `should match non-kana or symbols under "他"` confirm the regex patterns in `MasterDataLayout.tsx` successfully match standard inputs and boundary cases.
   - The test `should render and load options dynamically when lookup field is defined` confirms that `LookupSelect` maps target schema keys, value keys, and label keys correctly.

---

## 3. Caveats

- Database integration relies on local mocks representing the Supabase API. Real database latency variations and socket timeouts were not simulated.

---

## 4. Conclusion

- The Milestone 3 refactoring is **highly stable**, passing all TypeScript compiler and Vitest checks.
- The timeout promise settling in `AuthContext.tsx` is safe from unhandled rejections and leaks.
- **Critical finding (leak discovered)**: `LoginGate.tsx` suffers from a timer leakage when a login task resolves successfully before the 10-second timeout, as the timer is never cleared.

---

## 5. Verification Method

To verify the test suite:
1. Run `npm run type-check` (verify exit code 0).
2. Run `npm run test` (verify 55 tests pass).
3. Read the tests in `src/features/repaper-route/__tests__/milestone3_verification.test.tsx`.

---
---

# Adversarial Review (Challenge) Report

**Overall risk assessment**: **LOW**

## Challenges

### [Medium] Challenge 1: LoginGate Timer Leakage

- **Assumption challenged**: That racing a promise with a `setTimeout` without clearing it is safe.
- **Attack scenario**: Frequent failed or successful logins by multiple users in quick succession, or heavy app re-mounts causing active timers to stack up.
- **Blast radius**: The node/browser event loop retains `setTimeout` handles until they expire. In case of high activity, this leads to unnecessary memory and CPU overhead. If the timeout promise lacks rejection handlers in other parts of the system, it could cause `UnhandledPromiseRejection` warnings.
- **Mitigation**: Add a `try...finally` cleanup wrapper in `LoginGate.tsx` to clear the timeout timer:
  ```typescript
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('AUTH_TIMEOUT')), 10000);
  });
  try {
    const result = await Promise.race([loginTask, timeout]);
    // handle success
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
  ```

### [Low] Challenge 2: SWR Fetcher Error State Catch-all in useMasterCRUD

- **Assumption challenged**: That the `toError` handler can parse any error type returned by the backend.
- **Attack scenario**: SWR fetcher encounters an abort signal error, network connection reset, or an HTML response (due to proxy failure) instead of JSON.
- **Blast radius**: `toError` defaults to `new Error(String(err))`, which prints raw HTML or generic strings directly to the user in Japanese notifications, reducing UX clarity.
- **Mitigation**: Implement a fallback check in `toError` to detect non-JSON error structures and provide a generic Japanese message like "通信エラーが発生しました。"
