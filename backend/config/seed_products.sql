-- =============================================
-- COMPREHENSIVE PRODUCT SEED WITH IMAGES
-- Run this in Supabase SQL Editor
-- =============================================
-- Images use Tata 1mg's public CDN (onemg.gumlet.io).
-- Any URL that 404s will gracefully show the category
-- gradient placeholder already built into ProductCard.
-- =============================================

-- ── 1. Update existing seeded products ────────────────────────────────────────

UPDATE products SET
  name        = 'Crocin 650mg Tablet',
  brand       = 'Crocin',
  manufacturer= 'GlaxoSmithKline',
  description = 'Paracetamol 650mg — fast relief from fever and mild to moderate pain.',
  price       = 32.00,
  discount_percent = 10,
  image_url   = 'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/mku4dpijz8oitaigvzlt.jpg'
WHERE slug = 'paracetamol-500mg';

UPDATE products SET
  name        = 'Limcee 500mg Chewable Tablet',
  brand       = 'Limcee',
  manufacturer= 'Abbott India',
  description = 'Vitamin C 500mg chewable tablet. Supports immunity and antioxidant protection.',
  price       = 42.00,
  discount_percent = 5,
  image_url   = 'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1601384967/pharmacy_images/jd7pfujjewxzm2dxkz8j.jpg'
WHERE slug = 'vitamin-c-1000mg';

UPDATE products SET
  name        = 'Azithral 500mg Tablet',
  brand       = 'Azithral',
  manufacturer= 'Alembic Pharmaceuticals',
  description = 'Azithromycin 500mg antibiotic for respiratory, skin and urinary tract infections.',
  price       = 98.00,
  discount_percent = 8,
  prescription_required = true,
  image_url   = 'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1551953136/pharmacy_images/nhrjnspjjkqhm3k8fbxy.jpg'
WHERE slug = 'azithromycin-500mg';

UPDATE products SET
  description = 'Omron HEM-7120 clinically validated upper-arm BP monitor with WHO indicator.',
  price       = 1899.00,
  discount_percent = 20,
  image_url   = 'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1553771736/pharmacy_images/c0nrb1e6zhrjnktv23fo.jpg'
WHERE slug = 'bp-monitor-digital';

UPDATE products SET
  name        = 'HK Vitals Fish Oil Omega-3',
  manufacturer= 'HealthKart',
  description = 'Triple-strength Omega-3 1000mg (EPA + DHA). Supports heart, brain and joints.',
  price       = 449.00,
  discount_percent = 20,
  image_url   = 'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1614162979/pharmacy_images/hktqumwfm5v7hkkcb1c0.jpg'
WHERE slug = 'omega3-fish-oil-1000mg';


-- ── 2. Insert new products ────────────────────────────────────────────────────

INSERT INTO products
  (category_id, name, slug, description, brand, manufacturer,
   price, discount_percent, prescription_required, image_url, tags)
VALUES

-- ─── MEDICINES ────────────────────────────────────────────────────────────────

(
  (SELECT id FROM categories WHERE slug='medicines'),
  'Dolo 650mg Tablet', 'dolo-650mg',
  'Paracetamol 650mg — most prescribed fever & pain tablet in India.',
  'Dolo', 'Micro Labs Ltd', 30.00, 0, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/rxd7o9jwsq9rkhbz0rzy.jpg',
  ARRAY['paracetamol','fever','pain','dolo']
),
(
  (SELECT id FROM categories WHERE slug='medicines'),
  'Combiflam Plus Tablet', 'combiflam-plus',
  'Ibuprofen 400mg + Paracetamol 325mg dual-action pain and fever relief.',
  'Combiflam', 'Sanofi India', 45.00, 5, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/tkrmb2s0gmhbr8pbfhga.jpg',
  ARRAY['ibuprofen','paracetamol','pain','inflammation']
),
(
  (SELECT id FROM categories WHERE slug='medicines'),
  'Pan 40mg Tablet', 'pan-40mg',
  'Pantoprazole 40mg proton pump inhibitor. Reduces excess stomach acid; used for GERD.',
  'Pan', 'Alkem Laboratories', 72.00, 10, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/tsmqx9lgtrj4n2xrbq8j.jpg',
  ARRAY['pantoprazole','acidity','gerd','ulcer']
),
(
  (SELECT id FROM categories WHERE slug='medicines'),
  'Omez 20mg Capsule', 'omez-20mg',
  'Omeprazole 20mg — PPI for acid reflux, peptic ulcers and heartburn.',
  'Omez', 'Dr. Reddy''s Laboratories', 55.00, 10, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/byacfmq9m5kcrcqv7a1o.jpg',
  ARRAY['omeprazole','acidity','ppi','stomach']
),
(
  (SELECT id FROM categories WHERE slug='medicines'),
  'Augmentin 625 Duo Tablet', 'augmentin-625-duo',
  'Amoxicillin 500mg + Clavulanic Acid 125mg broad-spectrum antibiotic.',
  'Augmentin', 'GlaxoSmithKline', 185.00, 0, true,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/psbfqp4kwadxjkzjm1i0.jpg',
  ARRAY['amoxicillin','antibiotic','infection','augmentin']
),
(
  (SELECT id FROM categories WHERE slug='medicines'),
  'Allegra 120mg Tablet', 'allegra-120mg',
  'Fexofenadine 120mg non-drowsy antihistamine for allergy relief.',
  'Allegra', 'Sanofi India', 145.00, 12, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/znm0yoabf9twcjt4pcag.jpg',
  ARRAY['fexofenadine','antihistamine','allergy','rhinitis']
),
(
  (SELECT id FROM categories WHERE slug='medicines'),
  'Montair LC Tablet', 'montair-lc',
  'Montelukast 10mg + Levocetirizine 5mg for allergic rhinitis and urticaria.',
  'Montair LC', 'Cipla Ltd', 158.00, 8, true,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/lhvagfbvjwnr8tlqoxt4.jpg',
  ARRAY['montelukast','levocetirizine','allergy','rhinitis']
),
(
  (SELECT id FROM categories WHERE slug='medicines'),
  'Okacet 10mg Tablet', 'okacet-10mg',
  'Cetirizine 10mg antihistamine for hay fever, urticaria and itching.',
  'Okacet', 'Cipla Ltd', 28.00, 0, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/dlmx5cqpw2rjlzq3pjy1.jpg',
  ARRAY['cetirizine','antihistamine','allergy','itching']
),
(
  (SELECT id FROM categories WHERE slug='medicines'),
  'Glycomet 500mg Tablet', 'glycomet-500mg',
  'Metformin 500mg — first-line medication for Type 2 diabetes management.',
  'Glycomet', 'USV Pvt Ltd', 35.00, 0, true,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/hwmk8nrtjlowjkjm7gy2.jpg',
  ARRAY['metformin','diabetes','blood sugar','glycomet']
),
(
  (SELECT id FROM categories WHERE slug='medicines'),
  'Telma 40mg Tablet', 'telma-40mg',
  'Telmisartan 40mg ARB antihypertensive for blood pressure control.',
  'Telma', 'Glenmark Pharmaceuticals', 95.00, 5, true,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/sqficpq0xnbgqc3oiqqy.jpg',
  ARRAY['telmisartan','blood pressure','hypertension','heart']
),
(
  (SELECT id FROM categories WHERE slug='medicines'),
  'Atorva 10mg Tablet', 'atorva-10mg',
  'Atorvastatin 10mg statin for lowering LDL cholesterol and cardiovascular risk.',
  'Atorva', 'Zydus Cadila', 85.00, 10, true,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/pfadnb3lkivxpcqomqhx.jpg',
  ARRAY['atorvastatin','cholesterol','statin','heart']
),
(
  (SELECT id FROM categories WHERE slug='medicines'),
  'Disprin 325mg Effervescent Tablet', 'disprin-325mg',
  'Aspirin 325mg — fast effervescent tablet for headache and mild pain relief.',
  'Disprin', 'Reckitt Benckiser', 22.00, 0, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/zfpvzwsirxr7pmhsdagp.jpg',
  ARRAY['aspirin','headache','pain','effervescent']
),

-- ─── VITAMINS & SUPPLEMENTS ───────────────────────────────────────────────────

(
  (SELECT id FROM categories WHERE slug='vitamins'),
  'Revital H Capsule', 'revital-h',
  'Multivitamin & multimineral with ginseng. Boosts energy, immunity and vitality.',
  'Revital H', 'Pfizer Ltd', 299.00, 15, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/jkotmkyp3rchbkfxgprh.jpg',
  ARRAY['multivitamin','ginseng','energy','revital']
),
(
  (SELECT id FROM categories WHERE slug='vitamins'),
  'Becosules Capsule', 'becosules-capsule',
  'B-complex with Vitamin C. Supports nerve function and energy metabolism.',
  'Becosules', 'Pfizer Ltd', 50.00, 5, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/wdgbccl7gkqxbmjfmphw.jpg',
  ARRAY['b-complex','vitamin b','energy','nerve']
),
(
  (SELECT id FROM categories WHERE slug='vitamins'),
  'Neurobion Forte Tablet', 'neurobion-forte',
  'Vitamin B1 + B6 + B12 combination. Supports nerve health and reduces weakness.',
  'Neurobion Forte', 'Merck Ltd', 45.00, 0, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/eaxugjsmkagmqgfp4uos.jpg',
  ARRAY['vitamin b12','nerve','neurobion','b-complex']
),
(
  (SELECT id FROM categories WHERE slug='vitamins'),
  'Shelcal 500 Tablet', 'shelcal-500',
  'Calcium 500mg + Vitamin D3 250IU. Essential for strong bones and teeth.',
  'Shelcal', 'Elder Pharmaceuticals', 128.00, 10, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/hjohwkr4sbwvjxxgofpq.jpg',
  ARRAY['calcium','vitamin d3','bones','shelcal']
),
(
  (SELECT id FROM categories WHERE slug='vitamins'),
  'Evion 400mg Capsule', 'evion-400mg',
  'Vitamin E 400mg softgel. Antioxidant supporting skin health and immunity.',
  'Evion', 'Merck Ltd', 55.00, 5, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/koxgcq7ldkrj0yjrknxv.jpg',
  ARRAY['vitamin e','antioxidant','skin','evion']
),
(
  (SELECT id FROM categories WHERE slug='vitamins'),
  'Vitamin D3 60000 IU Capsule', 'vitamin-d3-60000iu',
  'High-dose Vitamin D3 for deficiency correction. Weekly dosing for convenience.',
  'D3-Must', 'Tablet India Ltd', 168.00, 12, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/xlprpcrdmjz8bpqxj6fb.jpg',
  ARRAY['vitamin d3','deficiency','bones','weekly']
),
(
  (SELECT id FROM categories WHERE slug='vitamins'),
  'Himalaya Septilin Tablet', 'himalaya-septilin',
  'Herbal immunity booster with Guduchi and Licorice. Enhances natural resistance.',
  'Septilin', 'Himalaya Drug Company', 135.00, 8, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/wkhlgijfqzdjhsqwvpml.jpg',
  ARRAY['immunity','herbal','himalaya','septilin']
),

-- ─── PERSONAL CARE ────────────────────────────────────────────────────────────

(
  (SELECT id FROM categories WHERE slug='personal-care'),
  'Cetaphil Gentle Skin Cleanser 250ml', 'cetaphil-gentle-cleanser-250ml',
  'Soap-free, fragrance-free cleanser. Dermatologist recommended for sensitive skin.',
  'Cetaphil', 'Galderma India', 399.00, 10, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1581065539/pharmacy_images/cetaphil-gentle-skin-cleanser.jpg',
  ARRAY['cleanser','sensitive skin','cetaphil','face wash']
),
(
  (SELECT id FROM categories WHERE slug='personal-care'),
  'Himalaya Neem Face Wash 150ml', 'himalaya-neem-facewash-150ml',
  'Neem and turmeric face wash for pimple-prone oily skin. Gentle daily cleanser.',
  'Himalaya', 'Himalaya Drug Company', 120.00, 15, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1551361757/pharmacy_images/himalaya-neem-purifying-facewash.jpg',
  ARRAY['neem','face wash','himalaya','acne']
),
(
  (SELECT id FROM categories WHERE slug='personal-care'),
  'Garnier Micellar Cleansing Water 400ml', 'garnier-micellar-water-400ml',
  'No-rinse micellar water removes makeup, unclogs pores in one gentle step.',
  'Garnier', 'L''Oreal India', 275.00, 20, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/garnier-micellar-cleansing-water.jpg',
  ARRAY['micellar','makeup remover','garnier','cleanser']
),
(
  (SELECT id FROM categories WHERE slug='personal-care'),
  'Neutrogena Hydro Boost Gel-Cream 50g', 'neutrogena-hydro-boost-50g',
  'Hyaluronic acid gel-cream for deep, long-lasting hydration. Non-comedogenic.',
  'Neutrogena', 'Johnson & Johnson', 649.00, 18, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/neutrogena-hydro-boost-gel-cream.jpg',
  ARRAY['hyaluronic acid','moisturizer','neutrogena','hydration']
),
(
  (SELECT id FROM categories WHERE slug='personal-care'),
  'CeraVe Moisturizing Cream 177g', 'cerave-moisturizing-cream-177g',
  'Rich moisturizing cream with ceramides and hyaluronic acid for dry to very dry skin.',
  'CeraVe', 'L''Oreal India', 749.00, 10, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/cerave-moisturizing-cream.jpg',
  ARRAY['ceramide','moisturizer','cerave','dry skin']
),

-- ─── DEVICES & MONITORS ───────────────────────────────────────────────────────

(
  (SELECT id FROM categories WHERE slug='devices'),
  'Dr. Morepen BP02 Blood Pressure Monitor', 'dr-morepen-bp02',
  'Automatic upper-arm BP monitor with WHO indicator and irregular heartbeat detection.',
  'Dr. Morepen', 'Dr. Morepen Ltd', 1299.00, 15, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1553771736/pharmacy_images/dr-morepen-bp02-blood-pressure-monitor.jpg',
  ARRAY['bp monitor','blood pressure','morepen','device']
),
(
  (SELECT id FROM categories WHERE slug='devices'),
  'Accu-Chek Instant Glucometer Kit', 'accu-chek-instant-glucometer',
  '5-second blood glucose result, no coding required. Bluetooth-enabled.',
  'Accu-Chek', 'Roche Diagnostics', 1799.00, 12, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/accu-chek-instant-glucometer.jpg',
  ARRAY['glucometer','glucose','diabetes','accu-chek']
),
(
  (SELECT id FROM categories WHERE slug='devices'),
  'Dr. Trust Pulse Oximeter', 'dr-trust-pulse-oximeter',
  'Fingertip SpO2 and pulse rate monitor. OLED display, auto power-off.',
  'Dr. Trust', 'Dr. Trust India', 1499.00, 10, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/dr-trust-pulse-oximeter.jpg',
  ARRAY['oximeter','spo2','pulse','oxygen']
),
(
  (SELECT id FROM categories WHERE slug='devices'),
  'Omron MC-246 Digital Thermometer', 'omron-thermometer-mc246',
  'Fast 10-second clinical thermometer. Flexible tip, waterproof, memory recall.',
  'Omron', 'Omron Healthcare', 399.00, 15, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/omron-mc-246-thermometer.jpg',
  ARRAY['thermometer','temperature','omron','fever']
),
(
  (SELECT id FROM categories WHERE slug='devices'),
  'Accu-Chek Test Strips (25 strips)', 'accu-chek-test-strips-25',
  'Compatible with Accu-Chek Active & Performa. Accurate glucose test strips.',
  'Accu-Chek', 'Roche Diagnostics', 599.00, 5, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/accu-chek-test-strips.jpg',
  ARRAY['test strips','glucose','diabetes','accu-chek']
),

-- ─── BABY & MOM ───────────────────────────────────────────────────────────────

(
  (SELECT id FROM categories WHERE slug='baby-mom'),
  'Himalaya Baby Gentle Shampoo 200ml', 'himalaya-baby-shampoo-200ml',
  'No-tears baby shampoo with chickpea and bhringraj extracts.',
  'Himalaya Baby', 'Himalaya Drug Company', 165.00, 10, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1551361757/pharmacy_images/himalaya-baby-shampoo.jpg',
  ARRAY['baby shampoo','no tears','himalaya','infant']
),
(
  (SELECT id FROM categories WHERE slug='baby-mom'),
  'Johnson''s Baby Powder 200g', 'johnsons-baby-powder-200g',
  'Clinically tested gentle formula keeps baby''s skin dry, soft and fresh.',
  'Johnson''s', 'Johnson & Johnson', 199.00, 5, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/johnsons-baby-powder.jpg',
  ARRAY['baby powder','johnsons','infant','soft']
),
(
  (SELECT id FROM categories WHERE slug='baby-mom'),
  'Pampers Baby-Dry Pants Medium (64 count)', 'pampers-baby-dry-pants-m64',
  'Up to 12-hour dryness. 360° stretchy waistband for comfort and fit.',
  'Pampers', 'Procter & Gamble', 699.00, 15, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/pampers-baby-dry-pants-medium.jpg',
  ARRAY['diapers','pampers','baby pants','dry']
),
(
  (SELECT id FROM categories WHERE slug='baby-mom'),
  'Mamaearth Moisturizing Baby Lotion 400ml', 'mamaearth-baby-lotion-400ml',
  'Toxin-free lotion with shea butter & cocoa butter. MadeSafe certified.',
  'Mamaearth', 'Honasa Consumer Ltd', 349.00, 10, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/mamaearth-baby-lotion.jpg',
  ARRAY['baby lotion','mamaearth','shea butter','toxin free']
),

-- ─── AYURVEDA ─────────────────────────────────────────────────────────────────

(
  (SELECT id FROM categories WHERE slug='ayurveda'),
  'Himalaya Ashwagandha Tablet', 'himalaya-ashwagandha-tablet',
  'Pure Ashwagandha (Withania somnifera) extract. Adaptogen for stress & vitality.',
  'Himalaya', 'Himalaya Drug Company', 165.00, 12, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1551361757/pharmacy_images/himalaya-ashwagandha.jpg',
  ARRAY['ashwagandha','adaptogen','stress','himalaya']
),
(
  (SELECT id FROM categories WHERE slug='ayurveda'),
  'Dabur Shilajit Gold Capsule', 'dabur-shilajit-gold-capsule',
  'Shilajit with gold bhasma, kesar and ashwagandha for strength and stamina.',
  'Dabur', 'Dabur India Ltd', 469.00, 10, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/dabur-shilajit-gold.jpg',
  ARRAY['shilajit','dabur','gold','stamina']
),
(
  (SELECT id FROM categories WHERE slug='ayurveda'),
  'Himalaya Triphala Tablet', 'himalaya-triphala-tablet',
  'Classical Triphala (Haritaki, Bibhitaki, Amalaki). Digestive wellness formula.',
  'Himalaya', 'Himalaya Drug Company', 135.00, 8, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1551361757/pharmacy_images/himalaya-triphala.jpg',
  ARRAY['triphala','digestion','himalaya','ayurveda']
),
(
  (SELECT id FROM categories WHERE slug='ayurveda'),
  'Patanjali Giloy Ghanvati Tablet', 'patanjali-giloy-ghanvati',
  'Pure Giloy (Guduchi) extract. Immunity booster and natural anti-inflammatory.',
  'Patanjali', 'Patanjali Ayurved Ltd', 75.00, 5, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/patanjali-giloy-ghanvati.jpg',
  ARRAY['giloy','immunity','patanjali','guduchi']
),
(
  (SELECT id FROM categories WHERE slug='ayurveda'),
  'Dabur Chyawanprash Special 500g', 'dabur-chyawanprash-500g',
  '41 Ayurvedic herbs with amla. Builds immunity, stamina and overall well-being.',
  'Dabur', 'Dabur India Ltd', 235.00, 15, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/dabur-chyawanprash.jpg',
  ARRAY['chyawanprash','dabur','immunity','herbs']
),

-- ─── COVID ESSENTIALS ────────────────────────────────────────────────────────

(
  (SELECT id FROM categories WHERE slug='covid-essentials'),
  'Dr. Morepen Hand Sanitizer 500ml', 'dr-morepen-sanitizer-500ml',
  '70% ethyl alcohol sanitizer. Kills 99.9% germs. No water required.',
  'Dr. Morepen', 'Dr. Morepen Ltd', 129.00, 20, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1563172927/pharmacy_images/dr-morepen-hand-sanitizer.jpg',
  ARRAY['sanitizer','hand sanitizer','alcohol','germs']
),
(
  (SELECT id FROM categories WHERE slug='covid-essentials'),
  'N95 Respirator Mask (Pack of 5)', 'n95-mask-pack-5',
  'NIOSH-approved N95 respirator. Filters ≥95% of airborne particles.',
  'Venus Safety', 'Venus Safety & Health', 349.00, 10, false,
  'https://onemg.gumlet.io/image/upload/f_auto,fl_lossy,q_auto/v1614162979/pharmacy_images/n95-mask.jpg',
  ARRAY['n95','mask','respirator','protection']
)

ON CONFLICT (slug) DO NOTHING;


-- ── 3. Seed inventory for all products ───────────────────────────────────────

INSERT INTO inventory (product_id, stock_quantity, low_stock_threshold)
SELECT id,
  CASE
    WHEN price > 1000 THEN 25
    WHEN price > 500  THEN 50
    ELSE 100
  END,
  10
FROM products
ON CONFLICT (product_id) DO UPDATE
  SET stock_quantity = EXCLUDED.stock_quantity;
