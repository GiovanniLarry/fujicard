import { products, categories } from './data/store.js';

console.log('=== Product Distribution by Category ===');
categories.forEach(cat => {
  const count = products.filter(p => p.category === cat.id).length;
  console.log(`${cat.name} (${cat.id}): ${count} products`);
  if (count === 0) {
    console.log('  ❌ No products found');
  } else {
    console.log('  ✅ Has products');
  }
});

console.log(`\nTotal products: ${products.length}`);
