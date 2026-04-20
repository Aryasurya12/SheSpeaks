require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testInsert() {
  console.log("Testing Supabase insert...");
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      {
        id: crypto.randomUUID(),
        full_name: "Test User",
        phone: null,
        role: 'user', // Trying 'user'
        anonymous_id: "ANON-12345"
      }
    ]);

  if (error) {
    console.error("Error inserting:", error);
  } else {
    console.log("Success:", data);
  }
}

testInsert();
