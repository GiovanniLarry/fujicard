-- Update category images with proper graphics
-- Run this in Supabase SQL Editor

UPDATE categories 
SET image_url = 'https://images.pokemontcg.io/swsh4/188_hires.png'
WHERE name = 'pokemon';

UPDATE categories 
SET image_url = 'https://images.ygoprodeck.com/images/cards/46986414.jpg'
WHERE name = 'yugioh';

UPDATE categories 
SET image_url = 'https://en.onepiece-cardgame.com/images/cardlist/card/OP01-001.png'
WHERE name = 'onepiece';

UPDATE categories 
SET image_url = 'https://images.pokemontcg.io/sv4a/231_hires.png'
WHERE name = 'newarrivals';

UPDATE categories 
SET image_url = 'https://images.pokemontcg.io/swsh7/215_hires.png'
WHERE name = 'specialrare';

UPDATE categories 
SET image_url = 'https://images.pokemontcg.io/swsh3/79_hires.png'
WHERE name = 'promo';

UPDATE categories 
SET image_url = 'https://m.media-amazon.com/images/I/71kZPnWQXWL._AC_SL1500_.jpg'
WHERE name = 'sealed';

UPDATE categories 
SET image_url = 'https://m.media-amazon.com/images/I/81xGjvDwURL._AC_SL1500_.jpg'
WHERE name = 'accessories';

-- Verify updates
SELECT name, image_url FROM categories ORDER BY name;
