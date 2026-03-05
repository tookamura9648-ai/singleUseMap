export default async function handler(req, res) {
  try {
    const coords = (req.query.coords || "").toString().trim();

    if (!coords || coords.split(";").length < 2) {
      return res.status(400).json({ error: "coords required" });
    }

    const url =
      "https://router.project-osrm.org/route/v1/driving/" +
      coords +
      "?overview=full&geometries=geojson";

    const r = await fetch(url);
    const data = await r.json();

    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: "route api error" });
  }
}
