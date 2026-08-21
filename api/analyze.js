const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    product: {
      type: 'object',
      additionalProperties: false,
      properties: {
        title: { type: ['string', 'null'] },
        brand: { type: ['string', 'null'] },
        model: { type: ['string', 'null'] },
        sku: { type: ['string', 'null'] },
        seller: { type: ['string', 'null'] },
        availability: { type: ['string', 'null'] },
        currency: { type: ['string', 'null'] },
        current_price: { type: ['number', 'null'] }
      },
      required: ['title','brand','model','sku','seller','availability','currency','current_price']
    },
    market: { type: 'string' },
    restricted_category: { type: 'boolean' },
    restriction_note: { type: ['string', 'null'] },
    deal_score: { type: ['number', 'null'] },
    fair_price_low: { type: ['number', 'null'] },
    fair_price_high: { type: ['number', 'null'] },
    overpayment_low: { type: ['number', 'null'] },
    overpayment_high: { type: ['number', 'null'] },
    confidence: { type: 'string' },
    value_for_money: { type: ['number', 'null'] },
    purchase_confidence: { type: ['number', 'null'] },
    scores: {
      type: 'object',
      additionalProperties: false,
      properties: {
        performance: { type: ['number','null'] },
        build: { type: ['number','null'] },
        features: { type: ['number','null'] },
        reliability: { type: ['number','null'] },
        price_value: { type: ['number','null'] }
      },
      required: ['performance','build','features','reliability','price_value']
    },
    positives: { type: 'array', items: { type: 'string' } },
    concerns: { type: 'array', items: { type: 'string' } },
    important_to_know: { type: 'array', items: { type: 'string' } },
    recommendation: { type: 'string' },
    summary: { type: 'string' },
    suggested_target_price: { type: ['number','null'] },
    seller_notes: { type: ['string','null'] },
    evidence: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          source: { type: 'string' },
          seller: { type: ['string','null'] },
          url: { type: 'string' },
          price: { type: ['number','null'] },
          currency: { type: ['string','null'] },
          condition: { type: ['string','null'] },
          timestamp: { type: ['string','null'] },
          match_note: { type: 'string' }
        },
        required: ['source','seller','url','price','currency','condition','timestamp','match_note']
      }
    },
    best_place_to_buy: {
      type: 'object',
      additionalProperties: false,
      properties: {
        retailer: { type: ['string','null'] },
        seller: { type: ['string','null'] },
        price: { type: ['number','null'] },
        currency: { type: ['string','null'] },
        url: { type: ['string','null'] },
        reason: { type: 'string' }
      },
      required: ['retailer','seller','price','currency','url','reason']
    },
    alternatives: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          brand: { type: ['string','null'] },
          model: { type: ['string','null'] },
          price: { type: ['number','null'] },
          currency: { type: ['string','null'] },
          retailer: { type: ['string','null'] },
          url: { type: ['string','null'] },
          reason: { type: 'string' },
          similarity: { type: 'string' }
        },
        required: ['title','brand','model','price','currency','retailer','url','reason','similarity']
      }
    }
  },
  required: [
    'product','market','restricted_category','restriction_note','deal_score',
    'fair_price_low','fair_price_high','overpayment_low','overpayment_high',
    'confidence','value_for_money','purchase_confidence','scores','positives',
    'concerns','important_to_know','recommendation','summary','suggested_target_price',
    'seller_notes','evidence','best_place_to_buy','alternatives'
  ]
};

function cleanUrl(value) {
  if (!value) return null;
  try {
    const u = new URL(value);
    if (!/^https?:$/.test(u.protocol)) return null;
    return u.toString();
  } catch (_) {
    return null;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body || {};
    const url = cleanUrl(body.url);
    const productName = String(body.productName || '').trim().slice(0, 300);
    const price = body.price === '' || body.price == null ? null : Number(body.price);
    const currency = String(body.currency || 'EUR').toUpperCase();
    const market = String(body.market || 'Europe').slice(0, 40);
    const country = String(body.country || 'EU').slice(0, 60);
    const screenshotDataUrl = typeof body.screenshotDataUrl === 'string' ? body.screenshotDataUrl : null;

    if (!url && !productName && !screenshotDataUrl) {
      return res.status(400).json({ error: 'Add a product link, screenshot, or product name.' });
    }
    if (price != null && (!Number.isFinite(price) || price < 0)) {
      return res.status(400).json({ error: 'Enter a valid product price.' });
    }
    if (screenshotDataUrl && screenshotDataUrl.length > 7_000_000) {
      return res.status(413).json({ error: 'That screenshot is too large. Please upload a smaller image.' });
    }

    const instructions = `
You are DEALCHECK, an AI shopping decision assistant.
Analyze ONE physical product using FRESH public web evidence available to you. The user wants a practical answer before buying.

MARKET: ${market}
COUNTRY/REGION: ${country}
USER URL: ${url || 'none'}
MANUAL PRODUCT NAME: ${productName || 'none'}
MANUAL PRICE: ${price == null ? 'unknown' : price} ${currency}

Critical evidence rules:
- Use fresh web search evidence for live prices. Never rely on memory for current prices.
- Prefer the manufacturer's store, reputable retailers, major marketplaces, and price-comparison sources that are publicly accessible.
- Compare exact or materially equivalent variants only. Check model/SKU, size, storage/capacity, color and condition when price can change.
- Separate new, refurbished and used products.
- Never invent a retailer, price, URL, review, specification or alternative.
- If evidence is weak, return nulls and lower confidence. Do not manufacture a fair-price range or overpayment number.
- The screenshot is evidence, not proof of the whole market.
- If a product is restricted/prohibited in the user's country/region or should not be analyzed under platform/payment/safety rules, set restricted_category=true and explain briefly. Do not provide purchasing guidance for it.
- Do not make unsupported claims of fraud, counterfeit, safety defects, authenticity or guaranteed savings.
- The best_place_to_buy must be the strongest VERIFIED current offer among the evidence, balancing price, seller reliability, availability and variant match. If no reliable winner exists, use nulls and explain why.
- alternatives should contain 3–5 materially comparable products only when reliable current evidence exists. Do not recommend an alternative just because it is cheaper.
- Keep evidence separate from assessment.
- Scores are decision aids, not scientific measurements.
- Recommendation must be one of BUY, WAIT, COMPARE, or INSUFFICIENT DATA.
- Return structured JSON only.
`;

    const input = [{ type: 'input_text', text: instructions }];
    if (url) input.push({ type: 'input_text', text: `Open and inspect this product URL if accessible: ${url}` });
    if (screenshotDataUrl) input.push({ type: 'input_image', image_url: screenshotDataUrl });

    const response = await client.responses.create({
      model: (process.env.OPENAI_MODEL && !['REPLACE_ME','gpt-5.6-luna'].includes(process.env.OPENAI_MODEL) ? process.env.OPENAI_MODEL : 'gpt-5.4'),
      tools: [{ type: 'web_search_preview' }],
      input: [{ role: 'user', content: input }],
      text: {
        format: {
          type: 'json_schema',
          name: 'dealcheck_report',
          strict: true,
          schema
        }
      }
    });

    const report = JSON.parse(response.output_text);
    return res.status(200).json({ report });
  } catch (err) {
    console.error(err);
    const code = err?.code || err?.type;
    if (code === 'insufficient_quota') {
      return res.status(402).json({ error: 'AI analysis quota is unavailable. Check the OpenAI billing/usage for the API project.' });
    }
    if (err?.status === 429) {
      return res.status(429).json({ error: 'The AI service is temporarily rate-limited. Please try again in a moment.' });
    }
    return res.status(500).json({ error: 'Analysis could not be completed. Try another product source or enter the product name and price manually.' });
  }
};
