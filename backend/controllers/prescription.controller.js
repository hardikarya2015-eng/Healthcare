const { createWorker } = require('tesseract.js');
const Fuse = require('fuse.js');
const supabase = require('../config/supabase');
const { successResponse, errorResponse } = require('../utils/response');

// ─── OCR ─────────────────────────────────────────────────────────────────────

const extractTextFromImage = async (buffer) => {
  const worker = await createWorker('eng', 1, { logger: () => {} });
  try {
    const { data: { text } } = await worker.recognize(buffer);
    return text;
  } finally {
    await worker.terminate();
  }
};

// ─── Medicine Parser ──────────────────────────────────────────────────────────

const FREQUENCY_RE = /\b(OD|BD|TDS|QID|TID|SOS|PRN|HS|STAT|QHS|QD|BID|once daily|twice daily|thrice daily)\b/i;
const DOSAGE_RE    = /\b(\d+(?:\.\d+)?\s*(?:mg|mcg|ml|g|gm|iu|units?))\b/i;
const DURATION_RE  = /\bx?\s*(\d+\s*(?:days?|weeks?|months?))\b/i;
const PREFIX_RE    = /^(?:tab(?:let)?s?\.?\s*|cap(?:sule)?s?\.?\s*|inj(?:ection)?\.?\s*|syp\.?\s*|syr\.?\s*|syrup\.?\s*|oint(?:ment)?\.?\s*|drops?\.?\s*|gel\.?\s*|cream\.?\s*|susp(?:ension)?\.?\s*)/i;
const TSP_RE       = /\b\d+\s*(?:tsp|teaspoon|tablespoon|tbsp|ml)\b/gi;

const parseMedicines = (rawText) => {
  const lines = rawText
    .split('\n')
    // Strip common OCR noise characters from line start/anywhere
    .map((l) => l.replace(/[=®©™°|\\{}[\]<>@#$%^&]/g, ' ').replace(/\s+/g, ' ').trim())
    .filter((l) => l.length > 3);

  const medicines = [];

  for (const line of lines) {
    // Skip lines that are pure dosage instructions (digit + dose unit, no medicine prefix)
    if (/^\d+\s+(?:tab(?:let)?s?|cap(?:sule)?s?|tsp|teaspoon|ml|drop|puff|app)/i.test(line)) continue;
    // Skip lines that are only frequency + duration with no medicine name e.g. "tid x 5 days"
    if (/^(?:OD|BD|TDS|QID|TID|SOS|HS|BID)\b/i.test(line)) continue;

    // Must have a medicine prefix (Tab/Cap/Syp), a mg/mcg dosage, or a frequency word
    const hasPrefix = PREFIX_RE.test(line);
    const hasDosage = DOSAGE_RE.test(line);
    const hasFreq   = FREQUENCY_RE.test(line);
    if (!hasPrefix && !hasDosage && !hasFreq) continue;

    const dosage    = line.match(DOSAGE_RE)?.[1]?.trim() || null;
    const frequency = line.match(FREQUENCY_RE)?.[1]?.toUpperCase() || null;
    const duration  = line.match(DURATION_RE)?.[1]?.trim() || null;

    let name = line
      .replace(/^\d+[\.\)]\s*/, '')       // remove "1. " numbering
      .replace(PREFIX_RE, '')              // remove Tab/Cap/Syp prefix at start
      // Handle OCR noise word before prefix e.g. "Yo Tab. Azithromycin"
      .replace(/^[a-zA-Z]{1,3}\s+/i, (m, offset, str) => {
        // Only strip if what follows looks like a medicine form prefix
        return /^(?:tab|cap|syp|inj|syrup|oint|drop|gel)/i.test(str.slice(m.length)) ? '' : m;
      })
      .replace(PREFIX_RE, '')              // strip prefix again after noise removal
      .replace(DOSAGE_RE, '')              // remove dosage
      .replace(FREQUENCY_RE, '')           // remove frequency
      .replace(DURATION_RE, '')            // remove duration
      .replace(TSP_RE, '')                 // remove "1 tsp", "5ml" dose instructions
      .replace(/\bx\b/gi, '')             // remove stray "x"
      .replace(/\(.*?\)/g, '')            // remove parentheticals like (p.c.) (for cough)
      .replace(/[-–—]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Strip any remaining leading non-letter noise
    name = name.replace(/^[^a-zA-Z]+/, '').trim();

    // Skip if name is too short, all digits, or has no real word (≥3 letters)
    if (name.length < 3 || /^\d+$/.test(name) || !/[a-zA-Z]{3,}/.test(name)) continue;

    name = name.replace(/\b\w/g, (c) => c.toUpperCase());
    medicines.push({ medicine_name: name, dosage, frequency, duration, raw_line: line });
  }

  return medicines;
};

// ─── Fuse.js Matcher ──────────────────────────────────────────────────────────

const matchWithFuse = (medicines, products) => {
  const fuseOptions = {
    keys: [
      { name: 'name',         weight: 0.5 },
      { name: 'description',  weight: 0.3 },
      { name: 'brand',        weight: 0.1 },
      { name: 'tags',         weight: 0.1 },
    ],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 3,
  };

  const fuse = new Fuse(products, fuseOptions);

  return medicines.map((med) => {
    const hits = fuse.search(med.medicine_name);

    const matches = hits.slice(0, 5).map((hit) => {
      const p = hit.item;
      const score = 1 - (hit.score ?? 0);             // convert to 0-1 confidence
      const nameLower = p.name.toLowerCase();
      const queryLower = med.medicine_name.toLowerCase();

      let match_type = 'alternative';
      if (nameLower.includes(queryLower) || queryLower.includes(nameLower.split(' ')[0])) {
        match_type = score > 0.8 ? 'exact' : 'generic';
      }

      return { ...p, match_type, score: Math.round(score * 100) };
    });

    return {
      prescribed: { ...med, confidence: matches.length > 0 ? matches[0].score / 100 : 0.5 },
      matches,
    };
  });
};

// ─── Controller ───────────────────────────────────────────────────────────────

const analyze = async (req, res) => {
  if (!req.file) return errorResponse(res, 'No image file provided', 400);

  try {
    // 1. OCR
    const rawText = await extractTextFromImage(req.file.buffer);

    if (!rawText || rawText.trim().length < 5) {
      return successResponse(res, { extracted_medicines: [], recommendations: [], needs_review: true });
    }

    // 2. Parse medicine lines
    const medicines = parseMedicines(rawText);

    // 3. Load products for Fuse.js matching
    const { data: products } = await supabase
      .from('products')
      .select('id, name, slug, brand, manufacturer, description, tags, price, discount_percent, discounted_price, image_url, prescription_required, categories(name, slug), inventory(stock_quantity)')
      .eq('is_active', true);

    // 4. Fuzzy match
    const recommendations = medicines.length > 0 && products?.length > 0
      ? matchWithFuse(medicines, products)
      : medicines.map((med) => ({ prescribed: med, matches: [] }));

    const needs_review = medicines.length === 0 || medicines.some((m) => (m.confidence ?? 0) < 0.6);

    // 5. Save record
    if (req.user) {
      await supabase.from('prescriptions').insert({
        user_id: req.user.id,
        file_url: 'ocr_processed',
        file_name: req.file.originalname || 'prescription',
        status: needs_review ? 'pending' : 'approved',
        ocr_status: 'completed',
        extracted_medicines: medicines,
      });
    }

    return successResponse(res, { extracted_medicines: medicines, recommendations, needs_review });
  } catch (err) {
    console.error('OCR error:', err.message);
    return errorResponse(res, 'OCR processing failed: ' + err.message, 500);
  }
};

const getMyPrescriptions = async (req, res) => {
  const { data, error } = await supabase
    .from('prescriptions')
    .select('id, file_name, status, ocr_status, extracted_medicines, created_at')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });
  if (error) return errorResponse(res, error.message, 500);
  return successResponse(res, data);
};

const updateStatus = async (req, res) => {
  const { status, notes } = req.body;
  const { data, error } = await supabase
    .from('prescriptions')
    .update({ status, notes, verified_at: new Date().toISOString() })
    .eq('id', req.params.id).select().single();
  if (error) return errorResponse(res, error.message, 400);
  return successResponse(res, data, 'Status updated');
};

module.exports = { analyze, getMyPrescriptions, updateStatus };
