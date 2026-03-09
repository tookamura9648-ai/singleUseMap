export default async function handler(req, res) {
  try {
    const coords = (req.query.coords || "").toString().trim();
    if (!coords || coords.split(";").length < 2) {
      return res.status(400).json({ error: "coords required (lng,lat;...)" });
    }

    const url =
      "https://router.project-osrm.org/table/v1/driving/" +
      coords +
      "?annotations=duration";

    const r = await fetch(url);
    if (!r.ok) {
      return res.status(502).json({ error: `osrm http ${r.status}` });
    }

    const data = await r.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: "table api failed", detail: String(e) });
  }
}
