const OpenAI = require('openai');
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    product: { type: 'object', additionalProperties: false, properties: {
      title: { type: ['string','null'] }, brand: { type: ['string','null'] }, model: { type: ['string','null'] }, seller: { type: ['string','null'] }, currency: { type: ['string','null'] }, current_price: { type: ['number','null'] }
    }, required: ['title','brand','model','seller','currency','current_price'] },
    market: { type: 'string' },
    deal_score: { type: ['number','null'] },
    fair_price_low: { type: ['number','null'] },
    fair_price_high: { type: ['number','null'] },
    overpayment_low: { type: ['number','null'] },
    overpayment_high: { type: ['number','null'] },
    confidence: { type: 'string' },
    positives: { type: 'array', items: { type: 'string' } },
    concerns: { type: 'array', items: { type: 'string' } },
    recommendation: { type: 'string' },
    summary: { type: 'string' },
    evidence: { type: 'array', items: { type: 'object', additionalProperties: false, properties: {
      source: { type: 'string' }, url: { type: 'string' }, price: { type: ['number','null'] }, currency: { type: ['string','null'] }, note: { type: 'string' }
    }, required: ['source','url','price','currency','note'] } }
  },
  required: ['product','market','deal_score','fair_price_low','fair_price_high','overpayment_low','overpayment_high','confidence','positives','concerns','recommendation','summary','evidence']
};

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { url, productName, price, currency, screenshotDataUrl, market = 'Europe' } = req.body || {};
    if (!url && !productName && !screenshotDataUrl) return res.status(400).json({ error: 'Нужна ссылка, скриншот или название товара.' });

    const input = [];
    input.push({ type: 'input_text', text: `You are DEALCHECK, a shopping decision assistant. Analyze a physical product using FRESH public web evidence. Market: ${market}. User URL: ${url || 'none'}. Manual product name: ${productName || 'none'}. Manual price: ${price || 'unknown'} ${currency || ''}. Never invent facts. If identity is uncertain, return nulls and explain. Compare exact/materially equivalent variants only. Separate evidence from assessment. Return structured JSON only. The user wants a practical answer before buying.` });
    if (screenshotDataUrl) input.push({ type: 'input_image', image_url: screenshotDataUrl });

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-5.4',
      tools: [{ type: 'web_search_preview' }],
      input: [{ role: 'user', content: input }],
      text: { format: { type: 'json_schema', name: 'dealcheck_report', strict: true, schema } }
    });

    const report = JSON.parse(response.output_text);
    return res.status(200).json({ report });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Не удалось выполнить анализ. Попробуйте другой источник или заполните данные товара вручную.' });
  }
};
