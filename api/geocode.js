// api/geocode.js  (CommonJS / Vercel Serverless Function)
module.exports = async (req, res) => {
  try {
    const q = (req.query.q || "").toString().trim();
    if (!q) {
      return res.status(200).json({ ok: true, found: false });
    }

    // 国土地理院 AddressSearch
    const url = "https://msearch.gsi.go.jp/address-search/AddressSearch?q=" + encodeURIComponent(q);

    const r = await fetch(url, {
      headers: {
        "Accept": "application/json"
      }
    });

    if (!r.ok) {
      return res.status(200).json({ ok: false, error: `upstream ${r.status}` });
    }

    const json = await r.json();
    if (!json || !Array.isArray(json) || json.length === 0) {
      return res.status(200).json({ ok: true, found: false });
    }

    // geometry.coordinates = [経度, 緯度]
    const coords = json[0]?.geometry?.coordinates;
    const lon = coords?.[0];
    const lat = coords?.[1];
    const display = json[0]?.properties?.title || q;

    if (typeof lat !== "number" || typeof lon !== "number") {
      return res.status(200).json({ ok: true, found: false });
    }

    return res.status(200).json({
      ok: true,
      found: true,
      lat,
      lng: lon,
      display
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
};



