/**
 * Supabaseとの通信を管理する共通クライアント
 */
const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE'; // 例: https://xxxxx.supabase.co
const SUPABASE_SERVICE_KEY = 'YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE';

function fetchFromSupabase(endpoint, method = 'GET', payload = null) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  
  const options = {
    method: method,
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json'
    },
    muteHttpExceptions: true
  };

  if (payload) {
    options.payload = JSON.stringify(payload);
  }

  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();
  
  if (responseCode >= 400) {
    throw new Error(`Supabase API Error: ${responseCode} - ${response.getContentText()}`);
  }
  
  const content = response.getContentText();
  return content ? JSON.parse(content) : null;
}

/**
 * テーブルからデータを取得
 */
function supabaseSelect(table, queryParams = '') {
  const endpoint = `${table}?${queryParams}`;
  return fetchFromSupabase(endpoint, 'GET');
}

/**
 * RPC関数（ストアドプロシージャ）を呼び出す
 */
function supabaseRpc(functionName, payload = {}) {
  const endpoint = `rpc/${functionName}`;
  return fetchFromSupabase(endpoint, 'POST', payload);
}
