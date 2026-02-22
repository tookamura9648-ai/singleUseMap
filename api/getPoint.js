import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ ok:false });
    }

    const key = "addr:" + address;
    const data = await redis.get(key);

    if (!data) {
      return res.status(200).json({ ok:true, found:false });
    }

    res.status(200).json({
      ok:true,
      found:true,
      lat:data.lat,
      lng:data.lng
    });

  } catch (e) {
    res.status(500).json({ ok:false, error:e.message });
  }
}
