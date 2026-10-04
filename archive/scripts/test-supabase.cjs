require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

(async () => {
  try {
    console.log('--- SUPABASE SAVING PROOF ---');
    console.log('1. Connecting to Supabase at:', process.env.VITE_SUPABASE_URL);
    
    const testItemCode = 'item_test_' + Date.now();
    const testItemName = '【テスト証明用】ダミー品目';

    console.log('\n2. Attempting to save (upsert) a test item to master_items...');
    const { error: insertError } = await supabase.from('master_items').upsert([
      { item_code: testItemCode, name: testItemName, is_active: true }
    ], { onConflict: 'item_code' });

    if (insertError) {
      console.error('❌ Failed to save to Supabase:', insertError);
      return;
    }
    console.log('✅ Save command executed successfully (No errors returned).');

    console.log('\n3. Verifying the save by fetching the item back from Supabase...');
    const { data, error: selectError } = await supabase
      .from('master_items')
      .select('*')
      .eq('item_code', testItemCode)
      .single();

    if (selectError) {
      console.error('❌ Failed to fetch from Supabase:', selectError);
      return;
    }

    if (data && data.name === testItemName) {
      console.log('✅ Verification SUCCESS: The item was found in the database!');
      console.log('   Data fetched directly from Supabase:', data);
    } else {
      console.error('❌ Verification FAILED: The item was not found or data is mismatched.');
    }

    console.log('\n4. Cleaning up (deleting test item)...');
    await supabase.from('master_items').delete().eq('item_code', testItemCode);
    console.log('✅ Cleanup SUCCESS.');
    console.log('------------------------------');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
})();
