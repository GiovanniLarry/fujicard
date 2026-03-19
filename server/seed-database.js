import { supabase } from './config/supabase.js';
import { products, categories } from './data/store.js';

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // First, seed categories
    console.log('📁 Seeding categories...');
    for (const category of categories) {
      const { data: existingCat, error: checkError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', category.id)
        .single();
      
      if (checkError && checkError.code === 'PGRST116') {
        // Category doesn't exist, insert it
        const { data, error } = await supabase
          .from('categories')
          .insert({
            id: category.id,
            name: category.name,
            description: category.description,
            image_url: category.image
          })
          .select();
        
        if (error) {
          console.error(`❌ Error inserting category ${category.name}:`, error);
        } else {
          console.log(`✅ Inserted category: ${category.name}`);
        }
      } else {
        console.log(`⏭️  Category already exists: ${category.name}`);
      }
    }
    
    // Then, seed products
    console.log('\n📦 Seeding products...');
    for (const product of products) {
      const { data: existingProd, error: checkError } = await supabase
        .from('products')
        .select('*')
        .eq('id', product.id)
        .single();
      
      if (checkError && checkError.code === 'PGRST116') {
        // Product doesn't exist, insert it
        const { data, error } = await supabase
          .from('products')
          .insert({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            original_price: product.originalPrice || product.original_price,
            image_url: product.image || product.image_url,
            category_id: product.category,
            card_type: product.cardType || product.card_type,
            set_name: product.set || product.set_name,
            rarity: product.rarity,
            condition: product.condition,
            language: product.language,
            stock: product.stock,
            featured: product.featured || false,
            promo: product.promo || false,
            discount: product.discount || null,
            graded: product.graded || false,
            grading_company: product.gradingCompany || product.grading_company,
            grade: product.grade || null
          })
          .select();
        
        if (error) {
          console.error(`❌ Error inserting product ${product.name}:`, error);
        } else {
          console.log(`✅ Inserted product: ${product.name}`);
        }
      } else {
        console.log(`⏭️  Product already exists: ${product.name}`);
      }
    }
    
    console.log('\n🎉 Database seeding completed!');
    
    // Verify the data
    const { data: finalProducts, error: productError } = await supabase
      .from('products')
      .select('*, categories(name)')
      .limit(5);
    
    if (productError) {
      console.error('Error verifying products:', productError);
    } else {
      console.log('\n📊 Sample products in database:');
      finalProducts.forEach(p => {
        console.log(`- ${p.name} (${p.categories?.name}) - £${p.price}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

seedDatabase();
