export default async function handler(req, res) {
  try {
    const q = (req.query.q || "").toString().trim();
    if (!q) return res.status(400).json({ ok: false, error: "q is required" });

    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("q", q);
    url.searchParams.set("accept-language", "ja");

    // Nominatimに“ちゃんとした呼び出し”として送る（重要）
    const r = await fetch(url.toString(), {
      headers: {
        "User-Agent": "koguchi-delivery/1.0 (contact: your-email@example.com)",
        "Accept": "application/json"
      }
    });

    if (!r.ok) {
      const text = await r.text().catch(() => "");
      return res.status(502).json({ ok: false, error: "upstream error", status: r.status, body: text });
    }

    const data = await r.json();
    const first = data?.[0];
    if (!first) return res.status(200).json({ ok: true, found: false });

    return res.status(200).json({
      ok: true,
      found: true,
      lat: Number(first.lat),
      lng: Number(first.lon),
      display: first.display_name
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || "server error" });
  }
}
