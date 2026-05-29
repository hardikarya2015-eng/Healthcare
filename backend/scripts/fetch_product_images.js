/**
 * Fetches real product image URLs from Tata 1mg by intercepting
 * the API calls the page makes, then updates Supabase.
 *
 * Usage:
 *   cd backend
 *   node scripts/fetch_product_images.js
 *
 * Requires: npx puppeteer (auto-installed on first run)
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Extract image URL from 1mg API response payloads ─────────────────────────
function extractImage(obj) {
  if (!obj || typeof obj !== 'object') return null;
  // Try common image field names
  for (const key of ['front_image', 'image', 'thumbnail', 'pack_size_label_image', 'featured_image']) {
    if (typeof obj[key] === 'string' && obj[key].startsWith('http')) return obj[key];
  }
  // Try nested images array
  if (Array.isArray(obj.images) && obj.images.length > 0) {
    const img = obj.images[0];
    return typeof img === 'string' ? img : img?.src || img?.url || null;
  }
  return null;
}

function findImage(data) {
  if (!data) return null;
  // data can be an array or an object with skus/items/products
  const items = Array.isArray(data)
    ? data
    : data.skus || data.items || data.products || data.data?.skus || data.data?.items || [];

  for (const item of items.slice(0, 5)) {
    const img = extractImage(item);
    if (img) return img;
  }
  return null;
}

// ── Search 1mg using Puppeteer, intercept API responses ──────────────────────
async function getImageFromOneMg(browser, productName) {
  const page = await browser.newPage();
  let foundImage = null;

  try {
    // Intercept JSON responses from 1mg's internal API
    page.on('response', async (response) => {
      if (foundImage) return;
      const url = response.url();
      // Only look at 1mg API calls that might contain product data
      if (
        url.includes('1mg.com') &&
        (url.includes('drug_sku') || url.includes('catalog') || url.includes('search') || url.includes('autocomplete'))
      ) {
        try {
          const ct = response.headers()['content-type'] || '';
          if (!ct.includes('json')) return;
          const json = await response.json().catch(() => null);
          if (!json) return;
          const img = findImage(json);
          if (img) foundImage = img;
        } catch (_) { /* ignore */ }
      }
    });

    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    );

    const query = encodeURIComponent(productName);
    await page.goto(`https://www.1mg.com/search/all?name=${query}`, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // If we got it from intercepted API, return it
    if (foundImage) return foundImage;

    // DOM fallback: find product photo JPGs (1mg uses watermarked gumlet URLs)
    const imgSrc = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      for (const img of imgs) {
        const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
        if (
          src.includes('onemg.gumlet.io') &&
          src.includes('.jpg') &&
          !src.includes('quick_buy') &&
          !src.includes('marketing') &&
          !src.includes('banner') &&
          !src.includes('logo') &&
          !src.includes('.svg')
        ) {
          // Strip the watermark overlay transform, keep just the clean CDN hash
          // Input:  https://onemg.gumlet.io/l_watermark_346,.../f_auto/[hash].jpg
          // Output: https://onemg.gumlet.io/f_auto,fl_lossy,q_auto/[hash].jpg
          const match = src.match(/onemg\.gumlet\.io\/.*?(?:f_auto[^/]*\/)((?:cropped\/)?[a-zA-Z0-9_-]+\.jpg)/);
          if (match) {
            return `https://onemg.gumlet.io/f_auto,fl_lossy,q_auto/${match[1]}`;
          }
          return src;
        }
      }
      return null;
    });

    return imgSrc || null;
  } catch (err) {
    return null;
  } finally {
    await page.close().catch(() => {});
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  // Dynamically import puppeteer (ESM compat)
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch (_) {
    // Try loading from npx cache
    const { execSync } = require('child_process');
    execSync('npm install puppeteer --no-save', { stdio: 'inherit', cwd: __dirname + '/..' });
    puppeteer = require('puppeteer');
  }

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, brand, slug, image_url')
    .order('name');

  if (error) { console.error('Supabase error:', error.message); process.exit(1); }

  console.log(`\nLaunching browser to fetch images for ${products.length} products...\n`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  let updated = 0, skipped = 0;

  try {
    for (const product of products) {
      const searchName = product.brand
        ? `${product.name} ${product.brand}`
        : product.name;

      process.stdout.write(`  ${product.name.substring(0, 50).padEnd(50)} ... `);

      const imageUrl = await getImageFromOneMg(browser, searchName);

      if (imageUrl) {
        const { error: upErr } = await supabase
          .from('products')
          .update({ image_url: imageUrl })
          .eq('id', product.id);

        if (upErr) {
          console.log(`DB error: ${upErr.message}`);
        } else {
          console.log(`✓  ${imageUrl.substring(0, 60)}`);
          updated++;
        }
      } else {
        console.log(`no image found`);
        skipped++;
      }

      // Be polite — don't hammer 1mg
      await delay(1500);
    }
  } finally {
    await browser.close();
  }

  console.log(`\n✓ Done.  Updated: ${updated}   No image: ${skipped}\n`);
}

run().catch((err) => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
