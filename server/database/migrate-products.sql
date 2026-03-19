-- Migrate products from store.js to Supabase
-- This bypasses RLS by running as database owner

-- First, let's disable RLS temporarily for migration
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Insert Pokemon Cards
INSERT INTO products (name, description, price, image_url, category_id, card_type, set_name, rarity, condition, language, stock, featured)
SELECT 
  p.name,
  p.description,
  p.price,
  p.image,
  c.id,
  p.card_type,
  p.set_name,
  p.rarity,
  p.condition::card_condition,
  p.language,
  p.stock,
  p.featured
FROM (
  VALUES
    ('Pikachu VMAX Rainbow Rare', 'Pikachu VMAX Rainbow Rare from Vivid Voltage set. Near Mint condition.', 85.00, 'https://images.pokemontcg.io/swsh4/188_hires.png', 'pokemon', 'Pokemon', 'Vivid Voltage', 'Rainbow Rare', 'Near Mint', 'English', 3, true),
    ('Charizard V Full Art', 'Charizard V Full Art from Darkness Ablaze. Mint condition.', 45.00, 'https://images.pokemontcg.io/swsh3/79_hires.png', 'pokemon', 'Pokemon', 'Darkness Ablaze', 'Full Art', 'Mint', 'English', 5, true),
    ('Mew VMAX Alt Art', 'Mew VMAX Alternate Art from Fusion Strike. Pack fresh.', 120.00, 'https://images.pokemontcg.io/swsh8/268_hires.png', 'pokemon', 'Pokemon', 'Fusion Strike', 'Alt Art', 'Mint', 'English', 2, true),
    ('Umbreon VMAX Alt Art', 'Umbreon VMAX Alternate Art - Moonbreon. Evolving Skies.', 280.00, 'https://images.pokemontcg.io/swsh7/215_hires.png', 'pokemon', 'Pokemon', 'Evolving Skies', 'Alt Art', 'Mint', 'English', 1, true),
    ('Gengar VMAX', 'Gengar VMAX from Fusion Strike. Beautiful holo rare.', 35.00, 'https://images.pokemontcg.io/swsh8/157_hires.png', 'pokemon', 'Pokemon', 'Fusion Strike', 'Holo Rare', 'Mint', 'English', 8, true),
    ('Arceus VSTAR Gold', 'Arceus VSTAR Gold Star from Brilliant Stars.', 55.00, 'https://images.pokemontcg.io/swsh9/123_hires.png', 'pokemon', 'Pokemon', 'Brilliant Stars', 'Gold Star', 'Mint', 'English', 4, true),
    ('Pikachu AR (Japanese)', 'Pikachu Amazing Rare from Japanese VSTAR Universe.', 42.00, 'https://images.pokemontcg.io/sv2a/181_hires.png', 'pokemon', 'Pokemon', 'VSTAR Universe (JP)', 'Amazing Rare', 'Mint', 'Japanese', 6, true),
    ('Charizard ex SAR (Japanese)', 'Charizard ex Special Art Rare from Terastal Festival.', 95.00, 'https://images.pokemontcg.io/sv4a/165_hires.png', 'pokemon', 'Pokemon', 'Terastal Festival (JP)', 'SAR', 'Mint', 'Japanese', 3, true)
) AS p(name, description, price, image, category, card_type, set_name, rarity, condition, language, stock, featured)
JOIN categories c ON c.name = p.category
ON CONFLICT DO NOTHING;

-- Continue with more products...
-- (This is getting long, so I'll show a simpler approach)

-- Re-enable RLS after migration
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
