# Adversarial Challenge Report

## Challenge Summary

**Overall risk assessment**: HIGH

Through empirical verification and stress testing of `useDataSync.ts`, we discovered a critical race condition bug that can lead to stale/incorrect data being rendered on-screen after rapid date switching. 

## Challenges

### [High] Challenge 1: Asynchronous Race Condition on Rapid Date Switching

- **Assumption challenged**: The assumption that the asynchronous fetching flow in `useDataSync.ts` will always complete in chronological order, or that stale fetches will not overwrite the state of the active selected date.
- **Attack scenario**:
  1. The user views the board for Date A (`2026-07-01`). The component triggers `fetchData` for Date A.
  2. The user quickly clicks next/prev and views Date B (`2026-07-02`). The component triggers `fetchData` for Date B.
  3. The request for Date B resolves quickly (e.g. database query is fast) and updates the hook's state to Date B's content.
  4. The request for Date A resolves slowly (due to network lag or database load) and updates the hook's state to Date A's content.
  5. The hook's React state now holds Date A's data, but the selected date in the UI is Date B. The user sees out-of-sync and incorrect data.
- **Blast radius**: High. Users will silently view and edit data for the wrong date. Actions taken (e.g. rescheduling or allocating a job) might be written to the wrong date, leading to data corruption or silent operational failures.
- **Mitigation**: Introduce a local active flag or cancellation token inside the `useEffect` scope that runs `fetchData`, or check that the resolved date matches the current `date` state before updating React state. Alternatively, utilize an `AbortController` to cancel out-of-date in-flight requests.
  For example, in `useEffect`:
  ```typescript
  useEffect(() => {
      let isCurrent = true;
      const runFetch = async () => {
          // fetch logic ...
          if (isCurrent) {
              setData(newState);
          }
      };
      runFetch();
      return () => {
          isCurrent = false;
      };
  }, [date]);
  ```

### [Low] Challenge 2: LocalStorage Security/DOM Exception

- **Assumption challenged**: The assumption that `localStorage.getItem` is always available and safe to call directly.
- **Attack scenario**:
  1. If the browser blocks third-party storage or the application is running in an iframe with storage disabled, calling `localStorage.getItem` directly throws a `SecurityError` DOMException.
  2. Since `localStorage.getItem` is called during hook evaluation without error wrapping, the application crashes completely.
- **Blast radius**: Low (affects specific browser privacy setups).
- **Mitigation**: Wrap the storage access in a helper that safely falls back to a boolean or null if reading `localStorage` throws an exception.

## Stress Test Results

- **Rapid Date Switching Scenario** → Stale slow fetch should not overwrite fast new fetch → Stale slow fetch overwrote the fast new fetch, replacing Date B's jobs with Date A's jobs → **FAIL**
- **Invalid Date Input Scenario** → Hook should handle malformed/empty dates gracefully without crashing → Hook completed loading with empty dataset and logged a warning without crashing → **PASS**

## Unchallenged Areas

- **Supabase Realtime Channel Scale** — How the server scales with hundreds of concurrent channel subscriptions per date key was not stress-tested because we are in a mock/offline local verification environment.
