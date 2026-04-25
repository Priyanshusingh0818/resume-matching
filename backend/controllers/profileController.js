import db from '../db.js';

/**
 * GET /api/profile
 * Returns the merged user & profile data for the authenticated user.
 */
export function getProfile(req, res) {
  try {
    const userId = req.user.id;
    
    // Fetch user base details
    const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Fetch extended profile details, or create default if not exists
    let profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId);
    if (!profile) {
      db.prepare('INSERT INTO profiles (user_id) VALUES (?)').run(userId);
      profile = { phone: '', location: '', education: '[]', preferences: '{}' };
    }

    return res.json({ 
      success: true, 
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: profile.phone || '',
        location: profile.location || '',
        education: JSON.parse(profile.education || '[]'),
        preferences: JSON.parse(profile.preferences || '{}')
      } 
    });

  } catch (error) {
    console.error('[profileController] getProfile error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
}

/**
 * PUT /api/profile
 * Updates the user & profile data.
 * Body: { name, phone, location, education, preferences }
 */
export function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, phone, location, education, preferences } = req.body;
    
    if (name) {
      db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, userId);
    }
    
    // Check if profile exists
    const exists = db.prepare('SELECT 1 FROM profiles WHERE user_id = ?').get(userId);
    if (!exists) {
        db.prepare('INSERT INTO profiles (user_id) VALUES (?)').run(userId);
    }

    const edStr = Array.isArray(education) ? JSON.stringify(education) : '[]';
    const prefStr = typeof preferences === 'object' ? JSON.stringify(preferences) : '{}';

    db.prepare('UPDATE profiles SET phone = ?, location = ?, education = ?, preferences = ? WHERE user_id = ?')
      .run(phone || '', location || '', edStr, prefStr, userId);

    return res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('[profileController] updateProfile error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
}
