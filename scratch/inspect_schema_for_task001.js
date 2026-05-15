
import pg from 'pg';
const { Client } = pg;

// .env に基づく接続設定 (ポート 6543 / Transaction Pooler)
const connectionString = "postgresql://postgres:tDwqo3iozPe12W4Q@db.mjaoolcjjlxwstlpdgrg.supabase.co:6543/postgres";

async function inspectSchema() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log("[1/3] 接続成功: スキーマ調査を開始します。");

        // 1. テーブル一覧の取得
        const tableRes = await client.query(`
            SELECT tablename 
            FROM pg_catalog.pg_tables 
            WHERE schemaname = 'public' 
            AND tablename IN ('jobs', 'routes');
        `);
        console.log("\n[結果] public スキーマ内の対象テーブル:");
        console.table(tableRes.rows);

        // 2. routes テーブルの列構造確認
        console.log("\n[2/3] routes テーブルの列構造を確認中...");
        const routesColsRes = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'routes' 
            AND table_schema = 'public'
            ORDER BY ordinal_position;
        `);
        console.table(routesColsRes.rows);

        // 3. jobs テーブルが存在する場合、その構造も確認
        if (tableRes.rows.some(r => r.tablename === 'jobs')) {
            console.log("\n[3/3] jobs テーブルの列構造を確認中...");
            const jobsColsRes = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'jobs' 
                AND table_schema = 'public'
                ORDER BY ordinal_position;
            `);
            console.table(jobsColsRes.rows);
        } else {
            console.log("\n[3/3] jobs テーブルは独立して存在しません。");
        }

        console.log("\n--- 調査完了 ---");

    } catch (err) {
        console.error("調査エラー:", err.message);
    } finally {
        await client.end();
    }
}

inspectSchema();
