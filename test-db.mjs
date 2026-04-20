import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Parse .env.local manually
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#\s][^=]+)="(.*)"$/);
  if (match) {
    env[match[1]] = match[2];
  } else {
    const match2 = line.match(/^([^#\s][^=]+)=(.+)$/);
    if(match2) env[match2[1]] = match2[2];
  }
});

console.log("URL:", env.NEXT_PUBLIC_SUPABASE_URL);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testSelect() {
  console.log("Fetching Supabase profiles...");
  const { data, error } = await supabase
    .from('profiles')
    .select('*');

  if (error) {
    console.error("Fetch Error:", error);
  } else {
    console.dir(data, { depth: null });
  }
}

testSelect();
