import { supabase } from './config/supabase.js';

async function checkOrdersSchema() {
  console.log('🔍 Checking orders table schema...');
  
  try {
    // Try to get a single order to see the structure
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error fetching orders:', error);
      return;
    }
    
    if (orders && orders.length > 0) {
      console.log('📋 Current orders table columns:');
      console.log(Object.keys(orders[0]));
      
      console.log('\n📄 Sample order structure:');
      console.log(JSON.stringify(orders[0], null, 2));
    } else {
      console.log('📭 No orders found in the table');
      
      // Let's try to describe the table structure
      console.log('\n🔍 Attempting to describe table...');
      
      // Try to insert a test order to see what columns are required
      const testOrder = {
        user_id: null,
        session_id: 'test-session',
        order_number: 'TEST-123',
        status: 'test',
        payment_method: 'test',
        currency: 'GBP',
        subtotal: '0.00',
        shipping_cost: '0.00',
        total: '0.00'
      };
      
      const { data: insertResult, error: insertError } = await supabase
        .from('orders')
        .insert(testOrder)
        .select();
      
      if (insertError) {
        console.log('❌ Insert error (this shows us what columns are missing):');
        console.log(insertError.message);
        
        // Parse the error to understand what columns are missing
        if (insertError.message.includes('column')) {
          console.log('\n💡 The error suggests missing columns. Let me check what the table actually has...');
        }
      } else {
        console.log('✅ Test order created successfully');
        console.log('Columns available:', Object.keys(insertResult[0]));
        
        // Clean up the test order
        await supabase.from('orders').delete().eq('id', insertResult[0].id);
      }
    }
    
  } catch (error) {
    console.error('Schema check failed:', error);
  }
}

checkOrdersSchema();
