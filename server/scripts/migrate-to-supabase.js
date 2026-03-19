import { supabase } from '../config/supabase.js';
import { products, categories } from '../data/store.js';

/**
 * Migrate data from in-memory store.js to Supabase database
 * Run this once after setting up Supabase
 */
export async function migrateToSupabase() {
  if (!supabase) {
    console.log('❌ Supabase not configured. Skipping migration.');
    return;
  }

  try {
    console.log('🚀 Starting data migration to Supabase...\n');

    // 1. Migrate Categories
    console.log('📦 Migrating categories...');
    const categoriesToInsert = [
      { id: 'pokemon', name: 'Pokemon', description: 'Pokemon Trading Card Game singles and sealed products' },
      { id: 'yugioh', name: 'Yu-Gi-Oh!', description: 'Yu-Gi-Oh! Trading Card Game singles and sealed products' },
      { id: 'onepiece', name: 'One Piece', description: 'One Piece Card Game singles and sealed products' },
      { id: 'newarrivals', name: 'New Arrivals', description: 'Latest cards from all games - Fresh stock!' },
      { id: 'specialrare', name: 'Special & Rare', description: 'Ultra-rare collectibles and graded gems - Investment grade cards!' },
      { id: 'promo', name: 'Promo Cards', description: 'Special discounted cards - Limited time offers!' },
      { id: 'sealed', name: 'Sealed Products', description: 'Factory sealed booster boxes, ETBs, and collections' },
      { id: 'accessories', name: 'Accessories', description: 'Sleeves, binders, deck boxes, and playing accessories' }
    ];

    for (const category of categoriesToInsert) {
      const { error } = await supabase
        .from('categories')
        .update({ 
          name: category.name,
          description: category.description
        })
        .eq('name', category.id);

      if (error) {
        console.error(`Error updating category ${category.name}:`, error.message);
      } else {
        console.log(`✅ Category: ${category.name}`);
      }
    }

    // Wait a moment for categories to be inserted
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 2. Get category IDs from database
    const { data: dbCategories } = await supabase
      .from('categories')
      .select('id, name');

    const categoryMap = {};
    dbCategories?.forEach(cat => {
      categoryMap[cat.name.toLowerCase().replace(/[^a-z]/g, '')] = cat.id;
    });

    // 3. Migrate Products
    console.log('\n🎴 Migrating products...');
    let migratedCount = 0;

    for (const product of products) {
      // Map category to category_id
      let categoryId = null;
      if (product.category === 'pokemon') categoryId = categoryMap['pokemon'];
      else if (product.category === 'yugioh') categoryId = categoryMap['yugioh'];
      else if (product.category === 'onepiece') categoryId = categoryMap['onepiece'];
      else if (product.category === 'newarrivals') categoryId = categoryMap['newarrivals'];
      else if (product.category === 'specialrare') categoryId = categoryMap['specialrare'];
      else if (product.category === 'promo') categoryId = categoryMap['promo'];
      else if (product.category === 'sealed') categoryId = categoryMap['sealedproducts'];
      else if (product.category === 'accessories') categoryId = categoryMap['accessories'];

      // Map condition to enum values
      let conditionEnum = 'Mint';
      if (product.condition.includes('PSA 10') || product.condition.includes('CGC 10') || product.condition.includes('BGS 9.5')) {
        conditionEnum = 'Mint'; // Graded cards in top condition
      } else if (product.condition === 'Near Mint') {
        conditionEnum = 'Near Mint';
      } else if (product.condition === 'New' || product.condition === 'Sealed') {
        conditionEnum = 'Sealed';
      }

      const productData = {
        name: product.name,
        description: product.description,
        price: product.price,
        original_price: product.originalPrice || null,
        image_url: product.image,
        category_id: categoryId,
        card_type: product.cardType,
        set_name: product.set,
        rarity: product.rarity,
        condition: conditionEnum,
        language: product.language,
        stock: product.stock,
        featured: product.featured || false,
        promo: product.promo || false,
        discount: product.discount || 0,
        graded: product.graded || false,
        grading_company: product.gradingCompany || null,
        grade: product.grade || null
      };

      const { error } = await supabase
        .from('products')
        .insert(productData);

      if (error) {
        console.error(`Error inserting product ${product.name}:`, error.message);
      } else {
        migratedCount++;
        if (migratedCount % 10 === 0) {
          console.log(`   Migrated ${migratedCount} products...`);
        }
      }
    }

    console.log(`\n✅ Successfully migrated ${migratedCount} products to Supabase!`);
    console.log('\n✨ Migration complete!\n');

  } catch (error) {
    console.error('❌ Migration error:', error.message);
  }
}

// Auto-run migration if this file is executed directly
if (process.argv[1]?.endsWith('migrate-to-supabase.js')) {
  migrateToSupabase();
}
