
const supabaseUrl = 'https://mjaoolcjjlxwstlpdgrg.supabase.co/rest/v1/';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qYW9vbGNqamx4d3N0bHBkZ3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NTk0MDQsImV4cCI6MjA4NTIzNTQwNH0.Veyu2pcnPJHK6g3wj1JsNMskCh0sxdB_JWEi0lsWoQ0';

async function fetchSchema() {
    console.log("--- Fetching Schema via OpenAPI ---");
    try {
        const response = await fetch(supabaseUrl, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const schema = await response.json();
        
        const tables = ['jobs', 'routes'];
        tables.forEach(tableName => {
            const definition = schema.definitions[tableName];
            if (definition) {
                console.log(`\n[Found] テーブル: ${tableName}`);
                console.log("カラム一覧:");
                Object.keys(definition.properties).forEach(prop => {
                    const details = definition.properties[prop];
                    console.log(`  - ${prop} (${details.type}${details.format ? ':' + details.format : ''})`);
                });
            } else {
                console.log(`\n[NotFound] テーブル: ${tableName}`);
            }
        });

    } catch (err) {
        console.error("取得エラー:", err.message);
    }
}

fetchSchema();
