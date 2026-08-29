# ADR 011: GAS Sync and Purge RPC

## Context
Step 6 of the architecture migration (ADR 001) requires a Google Apps Script (GAS) to periodically export past data (like `daily_jobs`, `event_logs`, etc.) to Google Spreadsheets and subsequently delete them from Supabase to save space and maintain performance. 
However, Supabase is configured with a strict `protect_from_delete` trigger that prevents physical deletion unless the Postgres configuration variable `app.system_purge_mode` is set to `true` within the current transaction. A standard REST API request from an external script (like GAS) via PostgREST cannot securely set this configuration and execute `DELETE` in a single reliable transaction without exposing unwanted permissions.

## Decision
1.  **RPC `purge_old_data`**: We created a Postgres RPC (Stored Procedure) named `purge_old_data` in `scripts/008_create_purge_rpc.sql`. This function accepts a `target_date`, securely enables `app.system_purge_mode`, and deletes related `actuals`, `weighing_records`, `daily_jobs`, and `event_logs` older than the specified date.
2.  **Security**: The RPC is marked with `SECURITY DEFINER` but we explicitly revoked execution rights from `PUBLIC`, `anon`, and `authenticated` roles. It is strictly granted only to `service_role`. This ensures only trusted backend scripts (like GAS using the Service Key) can invoke the purge.
3.  **GAS Codebase**: We established a `gas/` directory in the repository to maintain the Google Apps Script code (`SupabaseClient.gs`, `ArchiveAndPurge.gs`, `HealthCheck.gs`) locally under version control.

## Rationale
Using a dedicated RPC abstracts the complex transaction and config logic away from the GAS client, providing a single, atomic, and secure endpoint (`/rest/v1/rpc/purge_old_data`). Requiring a successful spreadsheet write before calling this RPC mitigates the risk of data loss. Managing GAS scripts in Git enables code reviews and history tracking, even though execution occurs in the Google Cloud environment.

## Consequences
- **Positive**: Complete compliance with the strict physical deletion rules while achieving automated DB maintenance.
- **Negative**: The actual execution environment (Google Apps Script) is decoupled from the codebase, meaning manual copy-pasting or `clasp` setup is required to deploy these scripts.
