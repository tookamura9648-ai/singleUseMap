module.exports = async function (req, res) {
  try {
    const q = (req.query.q || "").toString().trim();
    if (!q) return res.status(400).json({ ok: false, error: "q is required" });

    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("q", q);
    url.searchParams.set("accept-language", "ja");
    url.searchParams.set("countrycodes", "jp");

    const r = await fetch(url.toString(), {
      headers: {
        "Accept": "application/json",
        // Nominatimのマナー：本当は連絡先を入れるのがベター（後であなたのメール等に差し替えOK）
        "User-Agent": "koguchi-delivery/1.0 (contact: example@example.com)"
      }
    });

    if (!r.ok) {
      const body = await r.text().catch(() => "");
      return res.status(502).json({ ok: false, error: "upstream error", status: r.status, body });
    }

    const data = await r.json();
    if (!data || data.length === 0) return res.status(200).json({ ok: true, found: false });

    const first = data[0];
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
};

