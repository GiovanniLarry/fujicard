import { supabase } from './config/supabase.js';

const setupAuthTables = async () => {
  try {
    console.log('🔧 Setting up authentication tables in Supabase...');

    // Create users table
    const { error: usersError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          address TEXT,
          city VARCHAR(100),
          postcode VARCHAR(20),
          country VARCHAR(100) DEFAULT 'United Kingdom',
          phone VARCHAR(30),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (usersError) {
      console.log('⚠️  Users table creation failed, trying alternative method...');
      // Alternative: Try direct table creation
      const { error: altError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      if (altError && altError.code === 'PGRST116') {
        console.log('❌ Users table does not exist. Please create it manually in Supabase dashboard.');
        console.log(`
📋 SQL to create users table in Supabase:
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  address TEXT,
  city VARCHAR(100),
  postcode VARCHAR(20),
  country VARCHAR(100) DEFAULT 'United Kingdom',
  phone VARCHAR(30),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
        `);
      } else {
        console.log('✅ Users table exists');
      }
    } else {
      console.log('✅ Users table created successfully');
    }

    // Test the connection
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Error accessing users table:', error.message);
    } else {
      console.log('✅ Users table is accessible');
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
};

setupAuthTables();
