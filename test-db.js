const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync(path.resolve('.env.local'), 'utf8');
let url = '', key = '';
envContent.split(/\r?\n/).forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim().replace(/['"]/g, '');
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim().replace(/['"]/g, '');
});

const supabase = createClient(url, key);

async function testInsert() {
  console.log("Checking reports table...");
  const { data, error } = await supabase
    .from('reports')
    .select('id, status, description, type')
    .limit(10);

  if (error) {
    console.error("Error fetching reports:", error);
  } else {
    console.log("Existing reports:", data);
  }
}

testInsert();
