import { supabase } from '../config/supabase.js';

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');

  if (!supabase) {
    console.log('❌ Supabase not configured properly');
    return;
  }

  try {
    // Test connection by fetching categories
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .limit(1);

    if (error) {
      if (error.message.includes('relation "categories" does not exist')) {
        console.log('⚠️  Database tables not created yet!\n');
        console.log('📋 Next steps:');
        console.log('1. Go to https://xfnemjjovywyzqeemjmk.supabase.co');
        console.log('2. Open SQL Editor');
        console.log('3. Run the SQL schema from: server/database/supabase-schema.sql\n');
        console.log('Full error:', error.message);
      } else {
        console.log('❌ Connection error:', error.message);
      }
      return;
    }

    console.log('✅ Connected to Supabase successfully!');
    console.log(`📊 Found ${data?.length || 0} categories in database\n`);

    if (data && data.length > 0) {
      console.log('Sample category:', data[0]);
    } else {
      console.log('💡 No categories found. Run the migration script to add products.');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testConnection();
