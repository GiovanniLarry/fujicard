-- Complete Product Migration to Supabase
-- Run this in Supabase SQL Editor to add ALL products from store.js

-- Temporarily disable RLS for migration
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- ============================================
-- POKEMON CARDS (Continue from the 8 already added)
-- ============================================

INSERT INTO products (name, description, price, image_url, category_id, card_type, set_name, rarity, condition, language, stock, featured)
SELECT 
  p.name, p.description, p.price, p.image, c.id,
  p.card_type, p.set_name, p.rarity, p.condition::card_condition,
  p.language, p.stock, p.featured
FROM (
  VALUES
    -- More Pokemon Cards
    ('Incineroar V', 'Incineroar V from Burning Shadows. Full art holo rare.', 18.00, 'https://images.pokemontcg.io/sm35/125_hires.png', 'pokemon', 'Pokemon', 'Burning Shadows', 'Full Art', 'Mint', 'English', 12, false),
    ('Lunala EX', 'Lunala EX from Guardians Rising. Ultra rare.', 22.00, 'https://images.pokemontcg.io/sm2a/84_hires.png', 'pokemon', 'Pokemon', 'Guardians Rising', 'Ultra Rare', 'Mint', 'English', 8, false),
    ('Garchomp & Giratina GX', 'Tag Team GX from Cosmic Eclipse.', 28.00, 'https://images.pokemontcg.io/sm12/149_hires.png', 'pokemon', 'Pokemon', 'Cosmic Eclipse', 'GX', 'Mint', 'English', 6, true),
    ('Crobat V', 'Crobat V from Darkness Ablaze. Amazing rare.', 32.00, 'https://images.pokemontcg.io/swsh3/109_hires.png', 'pokemon', 'Pokemon', 'Darkness Ablaze', 'Amazing Rare', 'Mint', 'English', 7, true),
    ('Toxtricity VMAX', 'Toxtricity VMAX from Rebel Clash.', 24.00, 'https://images.pokemontcg.io/swsh2/105_hires.png', 'pokemon', 'Pokemon', 'Rebel Clash', 'VMAX', 'Mint', 'English', 9, false)
) AS p(name, description, price, image, category, card_type, set_name, rarity, condition, language, stock, featured)
JOIN categories c ON c.name = p.category
ON CONFLICT DO NOTHING;

-- ============================================
-- YU-GI-OH! CARDS
-- ============================================

INSERT INTO products (name, description, price, image_url, category_id, card_type, set_name, rarity, condition, language, stock, featured)
SELECT 
  p.name, p.description, p.price, p.image, c.id,
  p.card_type, p.set_name, p.rarity, p.condition::card_condition,
  p.language, p.stock, p.featured
FROM (
  VALUES
    ('Blue-Eyes White Dragon', 'Blue-Eyes White Dragon - Legend of Blue Eyes. 1st Edition.', 185.00, 'https://images.ygoprodeck.com/images/cards/89631139.jpg', 'yugioh', 'Monster', 'Legend of Blue Eyes', 'Ultra Rare', 'Near Mint', 'English', 2, true),
    ('Dark Magician', 'Dark Magician - Spellbook of Secrets. 1st Edition.', 95.00, 'https://images.ygoprodeck.com/images/cards/46986414.jpg', 'yugioh', 'Monster', 'Spellbook of Secrets', 'Secret Rare', 'Mint', 'English', 4, true),
    ('Ash Blossom & Joyous Spring', 'Ash Blossom - 20th Anniversary Secret Rare.', 42.00, 'https://images.ygoprodeck.com/images/cards/14558127.jpg', 'yugioh', 'Monster', '20th Anniversary', 'Secret Rare', 'Mint', 'English', 15, true),
    ('Accesscode Talker', 'Accesscode Talker from Souls of the Duelists.', 38.00, 'https://images.ygoprodeck.com/images/cards/50078509.jpg', 'yugioh', 'Monster', 'Souls of the Duelists', 'Ultra Rare', 'Mint', 'English', 8, false),
    ('Pot of Prosperity', 'Pot of Prosperity - Structure Deck: Seto Kaiba.', 12.00, 'https://images.ygoprodeck.com/images/cards/38120068.jpg', 'yugioh', 'Spell', 'Structure Deck', 'Super Rare', 'Mint', 'English', 20, false),
    ('Nibiru, the Primal Being', 'Nibiru from Ignition Assault. Starlight Rare.', 28.00, 'https://images.ygoprodeck.com/images/cards/14558127.jpg', 'yugioh', 'Monster', 'Ignition Assault', 'Starlight Rare', 'Mint', 'English', 6, true)
) AS p(name, description, price, image, category, card_type, set_name, rarity, condition, language, stock, featured)
JOIN categories c ON c.name = p.category
ON CONFLICT DO NOTHING;

-- ============================================
-- ONE PIECE CARDS
-- ============================================

INSERT INTO products (name, description, price, image_url, category_id, card_type, set_name, rarity, condition, language, stock, featured)
SELECT 
  p.name, p.description, p.price, p.image, c.id,
  p.card_type, p.set_name, p.rarity, p.condition::card_condition,
  p.language, p.stock, p.featured
FROM (
  VALUES
    ('Monkey D. Luffy Leader', 'Monkey D. Luffy Leader Card - OP-01.', 18.00, 'https://en.onepiece-cardgame.com/images/cardlist/card/OP01-001.png', 'onepiece', 'Leader', 'OP-01', 'Common', 'Mint', 'English', 25, true),
    ('Roronoa Zoro Alt Art', 'Roronoa Zoro Alternate Art - OP-01.', 45.00, 'https://en.onepiece-cardgame.com/images/cardlist/card/OP01-002.png', 'onepiece', 'Character', 'OP-01', 'Alt Art', 'Mint', 'English', 8, true),
    ('Shanks SEC', 'Shanks Special Event Card - OP-01.', 65.00, 'https://en.onepiece-cardgame.com/images/cardlist/card/OP01-003.png', 'onepiece', 'Event', 'OP-01', 'SEC', 'Mint', 'English', 5, true),
    ('Nami Super Rare', 'Nami Super Rare from OP-01.', 22.00, 'https://en.onepiece-cardgame.com/images/cardlist/card/OP01-004.png', 'onepiece', 'Character', 'OP-01', 'Super Rare', 'Mint', 'English', 12, false),
    ('Trafalgar Law Leader', 'Trafalgar Law Leader Card - OP-02.', 20.00, 'https://en.onepiece-cardgame.com/images/cardlist/card/OP02-001.png', 'onepiece', 'Leader', 'OP-02', 'Common', 'Mint', 'English', 18, true),
    ('Yamato SP', 'Yamato Special Parallel - OP-03.', 38.00, 'https://en.onepiece-cardgame.com/images/cardlist/card/OP03-005.png', 'onepiece', 'Character', 'OP-03', 'Special Parallel', 'Mint', 'English', 7, true)
) AS p(name, description, price, image, category, card_type, set_name, rarity, condition, language, stock, featured)
JOIN categories c ON c.name = p.category
ON CONFLICT DO NOTHING;

-- ============================================
-- NEW ARRIVALS
-- ============================================

INSERT INTO products (name, description, price, image_url, category_id, card_type, set_name, rarity, condition, language, stock, featured, promo, discount)
SELECT 
  p.name, p.description, p.price, p.image, c.id,
  p.card_type, p.set_name, p.rarity, p.condition::card_condition,
  p.language, p.stock, p.featured, p.promo, p.discount
FROM (
  VALUES
    ('Terapagos ex SAR (Japanese)', 'Terapagos ex Special Art Rare from Terastal Festival. Brand new release!', 65.00, 'https://images.pokemontcg.io/sv4a/231_hires.png', 'newarrivals', 'Pokemon', 'Terastal Festival (JP)', 'SAR', 'Mint', 'Japanese', 8, true, false, 0),
    ('Snake-Eye Ash Blossom', 'Snake-Eye Ash Blossom - Hot new Yu-Gi-Oh support card!', 35.00, 'https://images.ygoprodeck.com/images/cards/14558127.jpg', 'newarrivals', 'Monster', 'Age of Overlord', 'Ultra Rare', 'Mint', 'English', 15, true, false, 0),
    ('Gear Luffy Leader', 'Gear 5 Luffy Leader - OP-05 Awakening of the New Era.', 28.00, 'https://en.onepiece-cardgame.com/images/cardlist/card/OP05-001.png', 'newarrivals', 'Leader', 'OP-05', 'Common', 'Mint', 'English', 20, true, false, 0),
    ('Iono Full Art Supporter', 'Iono Full Art Trainer from Scarlet & Violet.', 48.00, 'https://images.pokemontcg.io/sv1/249_hires.png', 'newarrivals', 'Trainer', 'Scarlet & Violet', 'Full Art', 'Mint', 'English', 10, true, false, 0),
    ('Brandeis SEC', 'Brandeis Secret Rare - One Piece OP-04.', 42.00, 'https://en.onepiece-cardgame.com/images/cardlist/card/OP04-088.png', 'newarrivals', 'Character', 'OP-04', 'Secret Rare', 'Mint', 'English', 6, true, false, 0),
    ('Chien-Pao ex Gold', 'Chien-Pao ex Gold Special Illustration Rare.', 58.00, 'https://images.pokemontcg.io/sv3pt5/171_hires.png', 'newarrivals', 'Pokemon', '151 (JP)', 'Gold SAR', 'Mint', 'Japanese', 5, true, false, 0),
    ('Kashtira Fenrir UR', 'Kashtira Fenrir Utimate Rare - Age of Overlord.', 32.00, 'https://images.ygoprodeck.com/images/cards/40915766.jpg', 'newarrivals', 'Monster', 'Age of Overlord', 'Ultimate Rare', 'Mint', 'English', 9, true, false, 0),
    ('Alolan Exeggutor VSTAR', 'Alolan Exeggutor VSTAR from Silver Tempest.', 26.00, 'https://images.pokemontcg.io/swsh12/18_hires.png', 'newarrivals', 'Pokemon', 'Silver Tempest', 'VSTAR', 'Mint', 'English', 11, true, false, 0),
    ('Ultimate Conquistador Tincan', 'Ultimate Conquistador Tincan - Phantom Rage.', 18.00, 'https://images.ygoprodeck.com/images/cards/60604515.jpg', 'newarrivals', 'Monster', 'Phantom Rage', 'Super Rare', 'Mint', 'English', 14, true, false, 0),
    ('Jewelry Bonney SP', 'Jewelry Bonney Special Parallel - OP-03.', 36.00, 'https://en.onepiece-cardgame.com/images/cardlist/card/OP03-042.png', 'newarrivals', 'Character', 'OP-03', 'SP', 'Mint', 'English', 8, true, false, 0),
    ('Miraidon ex Premium', 'Miraidon ex Premium Collection Exclusive.', 52.00, 'https://images.pokemontcg.io/sv2/199_hires.png', 'newarrivals', 'Pokemon', 'Paldea Evolved', 'ex', 'Mint', 'English', 6, true, false, 0),
    ('Azurite Dragon UR', 'Azurite Dragon Ultimate Rare - Cybernetic Horizon.', 24.00, 'https://images.ygoprodeck.com/images/cards/53616404.jpg', 'newarrivals', 'Monster', 'Cybernetic Horizon', 'Ultimate Rare', 'Mint', 'English', 10, true, false, 0)
) AS p(name, description, price, image, category, card_type, set_name, rarity, condition, language, stock, featured, promo, discount)
JOIN categories c ON c.name = p.category
ON CONFLICT DO NOTHING;

-- ============================================
-- PROMO CARDS (Discounted)
-- ============================================

INSERT INTO products (name, description, price, original_price, image_url, category_id, card_type, set_name, rarity, condition, language, stock, featured, promo, discount)
SELECT 
  p.name, p.description, p.price, p.original_price, p.image, c.id,
  p.card_type, p.set_name, p.rarity, p.condition::card_condition,
  p.language, p.stock, p.featured, p.promo, p.discount
FROM (
  VALUES
    ('Pikachu VMAX Rainbow Rare - PROMO', 'Pikachu VMAX Rainbow Rare from Vivid Voltage. 20% OFF!', 68.00, 85.00, 'https://images.pokemontcg.io/swsh4/188_hires.png', 'promo', 'Pokemon', 'Vivid Voltage', 'Rainbow Rare', 'Near Mint', 'English', 3, true, true, 20),
    ('Charizard V Full Art - PROMO', 'Charizard V Full Art from Darkness Ablaze. 25% OFF!', 33.75, 45.00, 'https://images.pokemontcg.io/swsh3/79_hires.png', 'promo', 'Pokemon', 'Darkness Ablaze', 'Full Art', 'Mint', 'English', 5, true, true, 25),
    ('Blue-Eyes White Dragon - PROMO', 'Blue-Eyes White Dragon. 15% OFF!', 157.25, 185.00, 'https://images.ygoprodeck.com/images/cards/89631139.jpg', 'promo', 'Monster', 'Legend of Blue Eyes', 'Ultra Rare', 'Near Mint', 'English', 2, true, true, 15),
    ('Monkey D. Luffy Leader - PROMO', 'Monkey D. Luffy Leader. 30% OFF!', 12.60, 18.00, 'https://en.onepiece-cardgame.com/images/cardlist/card/OP01-001.png', 'promo', 'Leader', 'OP-01', 'Common', 'Mint', 'English', 25, true, true, 30),
    ('Gengar VMAX - PROMO', 'Gengar VMAX from Fusion Strike. 22% OFF!', 27.30, 35.00, 'https://images.pokemontcg.io/swsh8/157_hires.png', 'promo', 'Pokemon', 'Fusion Strike', 'Holo Rare', 'Mint', 'English', 8, true, true, 22),
    ('Ash Blossom & Joyous Spring - PROMO', 'Ash Blossom. 18% OFF!', 34.44, 42.00, 'https://images.ygoprodeck.com/images/cards/14558127.jpg', 'promo', 'Monster', '20th Anniversary', 'Secret Rare', 'Mint', 'English', 15, true, true, 18),
    ('Nami Super Rare - PROMO', 'Nami Super Rare. 20% OFF!', 17.60, 22.00, 'https://en.onepiece-cardgame.com/images/cardlist/card/OP01-004.png', 'promo', 'Character', 'OP-01', 'Super Rare', 'Mint', 'English', 12, true, true, 20),
    ('Arceus VSTAR Gold - PROMO', 'Arceus VSTAR Gold Star. 27% OFF!', 40.15, 55.00, 'https://images.pokemontcg.io/swsh9/123_hires.png', 'promo', 'Pokemon', 'Brilliant Stars', 'Gold Star', 'Mint', 'English', 4, true, true, 27),
    ('Accesscode Talker - PROMO', 'Accesscode Talker. 25% OFF!', 28.50, 38.00, 'https://images.ygoprodeck.com/images/cards/50078509.jpg', 'promo', 'Monster', 'Souls of the Duelists', 'Ultra Rare', 'Mint', 'English', 8, true, true, 25),
    ('Trafalgar Law Leader - PROMO', 'Trafalgar Law Leader. 20% OFF!', 16.00, 20.00, 'https://en.onepiece-cardgame.com/images/cardlist/card/OP02-001.png', 'promo', 'Leader', 'OP-02', 'Common', 'Mint', 'English', 18, true, true, 20)
) AS p(name, description, price, original_price, image, category, card_type, set_name, rarity, condition, language, stock, featured, promo, discount)
JOIN categories c ON c.name = p.category
ON CONFLICT DO NOTHING;

-- ============================================
-- SEALED PRODUCTS
-- ============================================

INSERT INTO products (name, description, price, image_url, category_id, card_type, set_name, rarity, condition, language, stock, featured)
SELECT 
  p.name, p.description, p.price, p.image, c.id,
  p.card_type, p.set_name, p.rarity, p.condition::card_condition,
  p.language, p.stock, p.featured
FROM (
  VALUES
    ('Pokemon 151 Booster Box (JP)', 'Japanese Pokemon 151 Booster Box. 20 packs per box.', 95.00, 'https://m.media-amazon.com/images/I/71kZPnWQXWL._AC_SL1500_.jpg', 'sealed', 'Booster Box', '151 (JP)', 'Sealed', 'Sealed', 'Japanese', 15, true),
    ('Scarlet & Violet Elite Trainer Box', 'Elite Trainer Box from Scarlet & Violet base set. Includes 9 booster packs.', 45.00, 'https://m.media-amazon.com/images/I/81xGjvDwURL._AC_SL1500_.jpg', 'sealed', 'Elite Trainer Box', 'Scarlet & Violet', 'Sealed', 'Sealed', 'English', 8, true),
    ('Obsidian Flames Booster Box', 'Pokemon Obsidian Flames Booster Box. 36 packs.', 130.00, 'https://m.media-amazon.com/images/I/71R+YqKpOyL._AC_SL1500_.jpg', 'sealed', 'Booster Box', 'Obsidian Flames', 'Sealed', 'Sealed', 'English', 6, true),
    ('Paldea Evolved Booster Box', 'Pokemon Paldea Evolved Booster Box. 36 packs.', 125.00, 'https://m.media-amazon.com/images/I/71abc123XYZ._AC_SL1500_.jpg', 'sealed', 'Booster Box', 'Paldea Evolved', 'Sealed', 'Sealed', 'English', 7, true),
    ('Age of Overlord Booster Box', 'Yu-Gi-Oh Age of Overlord Booster Box. 24 packs.', 75.00, 'https://m.media-amazon.com/images/I/61TlBqVvFNL._AC_SL1200_.jpg', 'sealed', 'Booster Box', 'Age of Overlord', 'Sealed', 'Sealed', 'English', 10, true),
    ('One Piece OP-05 Booster Box', 'One Piece Card Game OP-05 Awakening of the New Era. 24 packs.', 110.00, 'https://en.onepiece-cardgame.com/images/cardlist/card/OP01-120.png', 'sealed', 'Booster Box', 'OP-05', 'Sealed', 'Sealed', 'English', 8, true),
    ('Pokemon Japanese Shiny Treasure ex', 'Japanese Shiny Treasure ex Booster Box. 20 packs.', 88.00, 'https://images.pokemontcg.io/sv4a/boxart.png', 'sealed', 'Booster Box', 'Shiny Treasure ex (JP)', 'Sealed', 'Sealed', 'Japanese', 12, true)
) AS p(name, description, price, image, category, card_type, set_name, rarity, condition, language, stock, featured)
JOIN categories c ON c.name = p.category
ON CONFLICT DO NOTHING;

-- ============================================
-- ACCESSORIES
-- ============================================

INSERT INTO products (name, description, price, image_url, category_id, card_type, set_name, rarity, condition, language, stock, featured)
SELECT 
  p.name, p.description, p.price, p.image, c.id,
  p.card_type, p.set_name, p.rarity, p.condition::card_condition,
  p.language, p.stock, p.featured
FROM (
  VALUES
    ('Ultra Pro Deck Box - Black', 'Standard Ultra Pro deck box in classic black. Holds 80+ sleeved cards.', 5.00, 'https://m.media-amazon.com/images/I/61vKJbKkOBL._AC_SL1500_.jpg', 'accessories', 'Deck Box', 'N/A', 'N/A', 'Sealed', 'N/A', 50, true),
    ('Dragon Shield Sleeves - Matte Black (100ct)', 'Premium Dragon Shield matte black card sleeves. Perfect fit.', 12.00, 'https://m.media-amazon.com/images/I/71R+YqKpOyL._AC_SL1500_.jpg', 'accessories', 'Sleeves', 'N/A', 'N/A', 'Sealed', 'N/A', 30, true),
    ('Ultra Pro 9-Pocket Binder - Black', 'Professional 9-pocket trading card binder. Holds up to 360 cards.', 18.00, 'https://m.media-amazon.com/images/I/81xGjvDwURL._AC_SL1500_.jpg', 'accessories', 'Binder', 'N/A', 'N/A', 'Sealed', 'N/A', 20, true),
    ('Dragon Shield Playmat - Nexus Blue', 'High-quality playmat with smooth surface. Nexus Blue design.', 22.00, 'https://m.media-amazon.com/images/I/71playmat123._AC_SL1500_.jpg', 'accessories', 'Playmat', 'N/A', 'N/A', 'Sealed', 'N/A', 15, true),
    ('Card Dividers for Binders (100 Pack)', 'White card dividers for organizing binders. 100 pack.', 8.00, 'https://m.media-amazon.com/images/I/61dividers456._AC_SL1200_.jpg', 'accessories', 'Dividers', 'N/A', 'N/A', 'Sealed', 'N/A', 40, true),
    ('Ultra Pro Toploaders (25 Pack)', 'Crystal clear toploaders for single cards. 25 pack.', 10.00, 'https://m.media-amazon.com/images/I/71topload789._AC_SL1500_.jpg', 'accessories', 'Toploaders', 'N/A', 'N/A', 'Sealed', 'N/A', 35, true),
    ('Ultimate Guard Deck Box - Red', 'Ultimate Guard deck box in vibrant red. Holds 100+ sleeved cards.', 8.00, 'https://m.media-amazon.com/images/I/61ugdeckbox._AC_SL1200_.jpg', 'accessories', 'Deck Box', 'N/A', 'N/A', 'Sealed', 'N/A', 25, false),
    ('BCW Monster Box - Purple', 'BCW monster storage box for bulk cards. Purple color.', 15.00, 'https://m.media-amazon.com/images/I/71monsterbox._AC_SL1500_.jpg', 'accessories', 'Storage', 'N/A', 'N/A', 'Sealed', 'N/A', 18, false),
    ('KMC Hyper Matte Sleeves (60ct)', 'KMC hyper matte finish sleeves. 60 count pack.', 9.00, 'https://m.media-amazon.com/images/I/61kmcsleeves._AC_SL1200_.jpg', 'accessories', 'Sleeves', 'N/A', 'N/A', 'Sealed', 'N/A', 28, false),
    ('Flip N'' Tray Deck Box', 'Flip N Tray deck box with built-in tray. Multiple colors available.', 12.00, 'https://m.media-amazon.com/images/I/71flipntray._AC_SL1500_.jpg', 'accessories', 'Deck Box', 'N/A', 'N/A', 'Sealed', 'N/A', 22, false),
    ('Dice Set - Gemstone (7-piece)', 'Gemstone effect dice set. 7 pieces including d20.', 14.00, 'https://m.media-amazon.com/images/I/61dicestone._AC_SL1200_.jpg', 'accessories', 'Dice Set', 'N/A', 'N/A', 'Sealed', 'N/A', 30, false),
    ('Card Grading Submission Kit', 'Complete kit for submitting cards to grading services.', 25.00, 'https://m.media-amazon.com/images/I/71gradingkit._AC_SL1500_.jpg', 'accessories', 'Grading Kit', 'N/A', 'N/A', 'Sealed', 'N/A', 10, false)
) AS p(name, description, price, image, category, card_type, set_name, rarity, condition, language, stock, featured)
JOIN categories c ON c.name = p.category
ON CONFLICT DO NOTHING;

-- Re-enable RLS after migration
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Show summary
SELECT 
  c.name as category,
  COUNT(p.id) as product_count
FROM products p
JOIN categories c ON p.category_id = c.id
GROUP BY c.name
ORDER BY product_count DESC;
