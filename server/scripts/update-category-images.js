import { supabase } from '../config/supabase.js';

async function updateCategoryImages() {
  console.log('🎨 Updating category images...\n');
  
  const categories = [
    { name: 'pokemon', url: 'https://images.pokemontcg.io/swsh4/188_hires.png' },
    { name: 'yugioh', url: 'https://images.ygoprodeck.com/images/cards/46986414.jpg' },
    { name: 'onepiece', url: 'https://en.onepiece-cardgame.com/images/cardlist/card/OP01-001.png' },
    { name: 'newarrivals', url: 'https://images.pokemontcg.io/sv4a/231_hires.png' },
    { name: 'specialrare', url: 'https://images.pokemontcg.io/swsh7/215_hires.png' },
    { name: 'promo', url: 'https://images.pokemontcg.io/swsh3/79_hires.png' },
    { name: 'sealed', url: 'https://m.media-amazon.com/images/I/71kZPnWQXWL._AC_SL1500_.jpg' },
    { name: 'accessories', url: 'https://m.media-amazon.com/images/I/81xGjvDwURL._AC_SL1500_.jpg' }
  ];
  
  for (const cat of categories) {
    const { error } = await supabase
      .from('categories')
      .update({ image_url: cat.url })
      .eq('name', cat.name);
    
    if (error) {
      console.log(`❌ Error updating ${cat.name}:`, error.message);
    } else {
      console.log(`✅ Updated ${cat.name}`);
    }
  }
  
  console.log('\n✅ All category images updated!\n');
  
  // Verify updates
  const { data } = await supabase.from('categories').select('name, image_url');
  console.log('Current category images:\n');
  data.forEach(cat => {
    console.log(`${cat.name.padEnd(15)} - ${cat.image_url}`);
  });
}

updateCategoryImages();
