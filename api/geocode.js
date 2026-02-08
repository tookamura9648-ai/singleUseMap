module.exports = async function (req, res) {
  try {
    const q = (req.query.q || "").toString().trim();
    if (!q) return res.status(400).json({ ok: false, error: "q is required" });

    const url = new URL("https://msearch.gsi.go.jp/address-search/AddressSearch");
    url.searchParams.set("q", q);

    const r = await fetch(url.toString(), {
      headers: {
        "Accept": "application/json",
        // 念のためUA（GSIはNominatimほど厳しくないが、付けておくと安心）
        "User-Agent": "KoguchiDelivery/1.0 (contact: your-email@example.com)"
      }
    });

    if (!r.ok) {
      const body = await r.text().catch(() => "");
      return res.status(502).json({ ok: false, error: "upstream error", status: r.status, body });
    }

    const data = await r.json();
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(200).json({ ok: true, found: false });
    }

    // GSI: geometry.coordinates = [lon, lat]
    const coords = data[0]?.geometry?.coordinates;
    if (!coords || coords.length < 2) {
      return res.status(200).json({ ok: true, found: false });
    }

    const lon = Number(coords[0]);
    const lat = Number(coords[1]);

    return res.status(200).json({
      ok: true,
      found: true,
      lat,
      lng: lon,
      // displayは任意：入力住所を使う運用なら不要
      display: data[0]?.properties?.title || q
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || "server error" });
  }
};



