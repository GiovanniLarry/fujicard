import { supabase } from '../config/supabase.js';

async function checkProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('name, price, stock, featured')
    .limit(10);

  if (error) {
    console.log('❌ Error:', error.message);
  } else {
    console.log('\n✅ Products in database:\n');
    data.forEach(p => {
      const featured = p.featured ? ' ⭐' : '';
      console.log(`  - ${p.name} - £${p.price} (Stock: ${p.stock})${featured}`);
    });
    console.log(`\n📊 Total shown: ${data.length} products\n`);
  }
  
  process.exit(0);
}

checkProducts();
