# ADR-0014: Deep Impact Assessment Protocol Enforcement

* **Status**: Accepted
* **Date**: 2026-04-26
* **Decider**: User / AI Agent

## Context and Problem Statement
When refactoring, reconstructing governance structures, or modifying code, there is a risk of inadvertently deleting or breaking critical dependencies or "inconvenient-to-delete" elements. To prevent regressions and structural damage, the AI must be structurally compelled to perform a deep investigation before implementation and halt if any risks are found.

## Decision Drivers
* The need to protect existing structural integrity and deep dependencies during refactoring or code modifications.
* Zero-Tolerance for guessing or continuing with incomplete impact analysis (C-3 No Guessing).
* The user's explicit directive to structurally force a plan review protocol if any anomalies or risks are discovered during the pre-flight check.

## Considered Options
1. Add a verbal rule to the prompt. (Insufficient: Prone to AI forgetfulness, weak enforcement).
2. Embed the rule in `AGENTS.md`. (Increases cognitive load, contrary to slim governance).
3. **Add a structural rule to `thought_rules.json` under `constitutional_guard`**. (Chosen: Directly modifies AI cognitive flow and acts as a structural gate before execution).

## Decision Outcome
Chosen option: "Add a structural rule to `thought_rules.json` under `constitutional_guard`", because it structurally forces the AI to execute the Deep Impact Assessment Protocol before any destructive or reconstructive actions, aligning with Governance-as-Data principles.

### Consequences
* **Positive**: Drastically reduces the risk of accidental deletion of critical dependencies. Forces a human-in-the-loop review (Plan Review Protocol) when risks are detected.
* **Negative**: May slightly increase pre-flight analysis time due to the required deep dependency scanning.

## Validation Plan
* The AI must self-report the activation of this protocol during the initial phase of any refactoring or modification task.
