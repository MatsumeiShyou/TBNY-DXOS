# Asset Management Protocol Log (AMPLOG)

すべての資産変更申請（AMP）の結果を記録する。
ステータスが「却下」の場合に限り理由を付記し、承認時は簡潔な記録に留めること。

| AMP ID | Date       | Content                                      | Status   | Reason (if Rejected) / Note |
|--------|------------|----------------------------------------------|----------|-----------------------------|
| 001    | 2026-02-10 | Initialize AMPLOG, SCHEMA_HISTORY, DEBT_FILE | Approved | Initial setup               |
| 002    | 2026-02-10 | Create Agents.md (Governance Constitution)   | Approved | User Instruction            |
| 003    | 2026-02-10 | Rename Agents.md to AGENTS.md                | Approved | User Correction             |
| 004    | 2026-02-10 | Create .agent/scripts/check_seal.js          | Approved | Governance Enforcement      |
| 005    | 2026-02-10 | Create supabase/migrations/20260210_initial_schema.sql | Approved | SDR Core Schema Implementation |
| 006    | 2026-02-10 | Remove Phase 3 from task.md & Update History | Approved | Scope Correction (Project Split) |
| 007    | 2026-02-10 | Initialize Frontend (Vite + React + TS)      | Approved | Implementation (Plan Executed)   |
| 008    | 2026-02-15 | Install DXOS Governance System (Blueprint)   | 承認 (PW: ｙ) | Architecture & Protocols         |
| 009    | 2026-02-15 | Upgrade DXOS to Blueprint v2.0 (Diff Install) | 承認 (PW: ｙ) | Bureaucracy & Infrastructure     |
| 010    | 2026-02-15 | Update project name and configuration (TBNY-DX-OS) | 承認 (PW: ｙ) | Supabase project rename |
| 011    | 2026-04-19 | Phase 7: Physical-Logical Mirroring Sync Engine | 承認 (PW: ｙ) | Implementation of Physical Column Sync |
| 012    | 2026-04-19 | Phase 1-2: DXOS Portal & Global Navigation Implementation | 承認 (PW: ｙ) | Portal & Multi-Entry Logic |
| 013    | 2026-04-19 | DXOS Portal and Entry-Point Optimization | 承認 (PW: ｙ) | Implementation of Dashboard Launcher |
| 013    | 2026-04-19 | AGENTS.md #1 に Root-Cause First (条項5) + Hotfix Route (条項6) を追加 | 承認 (PW: ｙ) | Governance Enhancement: A+C案採用 |
| 014    | 2026-04-19 | AGENTS.md #3 に CLI-First Mandate (条項4) を追加 — SQLエディタ禁止・CLI優先義務化 | 承認 (PW: ｙ) | Governance Enhancement: DB操作のCLI強制 |
| 015    | 2026-04-19 | AGENTS.md に第8層【過去知性同期】(TGS) を追加。高リスクタスクでの過去ログ走査を義務化 | 承認 (PW: ｙ) | Governance Enhancement: 過去知性の構造的活用 |
| 016    | 2026-04-29 | Staff Schema Standardization & AuthAdapter Integration | 承認 (PW: ｙ) | Implementation of Staff types, Adapter & Context |
| 017    | 2026-04-29 | ADR-0012 Creation & Secure RPC Implementation | 承認 (PW: ｙ) | Schema-Validated Dynamic RPC Pattern Implementation |
| 018    | 2026-04-29 | Debt List Sanitization & Governance Sync (v8.0) | 承認 (PW: ｙ) | Root/Gov Debt updated to AGENTS.md v8.0 |
| 019    | 2026-04-29 | Physical Enforcement: Husky & lint-staged Deployment | 承認 (PW: ｙ) | Automated lint/type-check on commit |
| 020    | 2026-04-29 | Governance Infrastructure Hardening | 承認 (PW: ｙ) | Context Archiving, Integrity Check Deployment, & Hook Optimization |
