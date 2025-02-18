const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const handleOAuthCallback = async (req, res) => {
  const { accessToken, refreshToken } = req.user;
  
  try {
    // Fetch user info from Oura API
    const response = await fetch('https://api.ouraring.com/v2/usercollection/personal_info', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const userData = await response.json();
    const ouraUserId = userData.id;

    // Store or update user in database
    const result = await pool.query(
      `INSERT INTO users (oura_user_id, access_token, refresh_token)
       VALUES ($1, $2, $3)
       ON CONFLICT (oura_user_id) 
       DO UPDATE SET 
         access_token = EXCLUDED.access_token,
         refresh_token = EXCLUDED.refresh_token,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id`,
      [ouraUserId, accessToken, refreshToken]
    );

    const userId = result.rows[0].id;

    // Create JWT token
    const token = jwt.sign(
      { 
        userId,
        ouraUserId
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/dashboard?token=${token}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
  }
};

module.exports = {
  handleOAuthCallback
}; 