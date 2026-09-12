import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const fileContent = readFileSync('./src/data/constants.ts', 'utf8');
  
  const startIndex = fileContent.indexOf('export const CUSTOMERS = [');
  if (startIndex === -1) {
    console.error("Could not find CUSTOMERS array in constants.ts");
    process.exit(1);
  }
  
  const jsonStart = fileContent.indexOf('[', startIndex);
  const jsonEnd = fileContent.lastIndexOf('];'); // this might be tricky, let's find the last '];'
  // Actually, since it's at the end of the file or somewhere, better to just slice it
  const sliceStr = fileContent.slice(jsonStart);
  let customersMatch = sliceStr.substring(0, sliceStr.indexOf('];') + 1);

  if (!customersMatch) {
    console.error("Could not parse CUSTOMERS string");
    process.exit(1);
  }

  let customers;
  try {
    customers = JSON.parse(customersMatch);
  } catch(e) {
    console.error("Failed to parse CUSTOMERS json", e);
    process.exit(1);
  }

  console.log(`Found ${customers.length} customers in constants.ts`);

  let updatedCount = 0;
  for (const c of customers) {
    if (c.kana && c.name) {
      const { data, error } = await supabase
        .from('master_collection_points')
        .update({ kana: c.kana })
        .eq('name', c.name);

      if (error) {
        console.error(`Error updating ${c.name}:`, error);
      } else {
        updatedCount++;
      }
    }
  }

  console.log(`Successfully processed updates for ${updatedCount} customers.`);
}

run().catch(console.error);
