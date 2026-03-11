export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const { query, location } = req.body;
  if (!query) { res.status(400).json({ error: 'Missing query' }); return; }

  const KEY = process.env.SERPAPI_KEY;
  if (!KEY) { res.status(500).json({ error: 'SERPAPI_KEY env var is not set or not found' }); return; }

  try {
    const q = encodeURIComponent(query + ' in ' + (location || 'Belfast') + ', UK');
    const url = `https://serpapi.com/search.json?engine=google_maps&q=${q}&api_key=${KEY}&hl=en&gl=gb&type=search`;

    const response = await fetch(url);
    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch(e) {
      res.status(500).json({ error: 'SerpApi returned non-JSON: ' + text.slice(0, 300) });
      return;
    }

    if (!response.ok) {
      res.status(response.status).json({ error: data.error || 'SerpApi error', detail: data });
      return;
    }

    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
