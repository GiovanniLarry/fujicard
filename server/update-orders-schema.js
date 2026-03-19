import { supabase } from './config/supabase.js';

async function updateOrdersSchema() {
  console.log('🔧 Updating orders table schema...');
  
  try {
    // First, let's check if the shipping address columns already exist
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (error && !error.message.includes('does not exist')) {
      console.log('📋 Current orders table columns:');
      
      // Try to describe the table by checking what columns we can access
      const testColumns = [
        'shipping_address',
        'shipping_city', 
        'shipping_postcode',
        'shipping_country',
        'shipping_phone',
        'shipping_email',
        'shipping_first_name',
        'shipping_last_name'
      ];
      
      for (const column of testColumns) {
        try {
          const { data, error: colError } = await supabase
            .from('orders')
            .select(column)
            .limit(1);
          
          if (!colError) {
            console.log(`✅ Column '${column}' exists`);
          } else {
            console.log(`❌ Column '${column}' missing: ${colError.message}`);
          }
        } catch (e) {
          console.log(`❌ Column '${column}' missing`);
        }
      }
    }
    
    // Since we can't alter tables easily with Supabase JS client, 
    // let's modify the orders route to work with the existing schema
    console.log('\n💡 Modifying approach: Using existing columns or creating a JSON shipping address field');
    
    // Test inserting an order with just the essential fields
    const testOrder = {
      user_id: null,
      session_id: 'test-session-' + Date.now(),
      order_number: `ORD-${Date.now()}`,
      status: 'pending',
      payment_method: 'card',
      currency: 'GBP',
      subtotal: '100.00',
      shipping_cost: '4.99',
      total: '104.99'
    };
    
    // Try to add shipping address as a JSON field if individual columns don't exist
    const shippingAddress = {
      firstName: 'Test',
      lastName: 'User',
      address: '123 Test Street',
      city: 'Test City',
      postcode: 'TE1 1ST',
      country: 'United Kingdom',
      phone: '+447000000000',
      email: 'test@example.com'
    };
    
    // Try with shipping_address as JSON
    const orderWithShipping = {
      ...testOrder,
      shipping_address: JSON.stringify(shippingAddress)
    };
    
    console.log('\n🧪 Testing order insertion with JSON shipping address...');
    
    const { data: result, error: insertError } = await supabase
      .from('orders')
      .insert(orderWithShipping)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Insert failed:', insertError.message);
      
      // Try without shipping_address field
      console.log('\n🧪 Testing basic order insertion...');
      const { data: basicResult, error: basicError } = await supabase
        .from('orders')
        .insert(testOrder)
        .select()
        .single();
      
      if (basicError) {
        console.log('❌ Basic insert failed:', basicError.message);
      } else {
        console.log('✅ Basic order created successfully');
        console.log('Available columns:', Object.keys(basicResult));
        
        // Clean up
        await supabase.from('orders').delete().eq('id', basicResult.id);
      }
    } else {
      console.log('✅ Order with JSON shipping address created successfully');
      console.log('Available columns:', Object.keys(result));
      
      // Clean up
      await supabase.from('orders').delete().eq('id', result.id);
    }
    
  } catch (error) {
    console.error('Schema update failed:', error);
  }
}

updateOrdersSchema();
