import { supabase } from '../config/supabase.js';

async function verifyProducts() {
  console.log('🔍 Verifying Supabase Database...\n');
  
  // Get total count
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });
  
  console.log(`📊 Total Products: ${count}\n`);
  
  // Get sample products
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      categories!inner(
        name
      )
    `)
    .limit(10);
  
  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }
  
  console.log('📦 Sample Products:\n');
  products.forEach((p, i) => {
    console.log(`${i+1}. ${p.name}`);
    console.log(`   Price: £${p.price} | Stock: ${p.stock}`);
    console.log(`   Category: ${p.categories?.name || 'N/A'}`);
    console.log(`   Featured: ${p.featured ? '✅' : '❌'} | Promo: ${p.promo ? `✅ (${p.discount}% off)` : '❌'}`);
    console.log('');
  });
  
  // Get category breakdown
  const { data: categories } = await supabase
    .from('categories')
    .select(`
      name,
      product_count:products(count)
    `);
  
  console.log('📂 Products by Category:\n');
  categories.forEach(cat => {
    const count = cat.product_count?.[0]?.count || 0;
    console.log(`   ${cat.name}: ${count} products`);
  });
  
  console.log('\n✅ Database verification complete!\n');
}

verifyProducts();
