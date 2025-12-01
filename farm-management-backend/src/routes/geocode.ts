import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

/**
 * GET /api/geocode/search?q=...
 * Proxies to OpenStreetMap Nominatim with proper headers and returns compact results.
 */
router.get('/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const q = (req.query.q as string) || (req.query.query as string) || '';
    if (!q || q.trim().length < 2) {
  res.json({ success: true, data: [] });
  return;
    }

    const email = process.env.NOMINATIM_EMAIL || 'support@example.com';

    const resp = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        format: 'json',
        addressdetails: 1,
        limit: 5,
        q,
      },
      headers: {
        'User-Agent': `FarmManagementApp/1.0 (${email})`,
        'Accept-Language': 'en',
      },
      timeout: 8000,
    });

    const results = (resp.data as any[]).map((r) => ({
      displayName: r.display_name,
      lat: Number(r.lat),
      lon: Number(r.lon),
      address: {
        road: r.address?.road,
        city: r.address?.city || r.address?.town || r.address?.village,
        state: r.address?.state,
        country: r.address?.country,
        postcode: r.address?.postcode,
      },
    }));

    res.json({ success: true, count: results.length, data: results });
    return;
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Geocoding failed', error: err?.message });
    return;
  }
});

export default router;
