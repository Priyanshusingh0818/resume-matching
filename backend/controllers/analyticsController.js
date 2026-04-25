import { computeUserAnalytics } from '../services/analyticsService.js';

export function getAnalytics(req, res) {
  try {
    const userId = req.user.id;
    const data = computeUserAnalytics(userId);
    res.json({ success: true, data });
  } catch (error) {
    console.error('[analyticsController] Error fetching analytics:', error.message);
    res.status(500).json({ success: false, error: { code: 'ANALYTICS_FAILED', message: 'Failed to aggregate analytics.' } });
  }
}
