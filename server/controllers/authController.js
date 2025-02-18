const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const handleOAuthCallback = async (req, res) => {
  console.log('🔐 OAuth Callback received:', { 
    timestamp: new Date().toISOString(),
    tokens: {
      hasAccessToken: !!req.user?.accessToken,
      hasRefreshToken: !!req.user?.refreshToken
    }
  });
  
  const { accessToken, refreshToken } = req.user;
  
  try {
    console.log('📡 Fetching user info from Oura API...');
    const response = await fetch('https://api.ouraring.com/v2/usercollection/personal_info', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      console.error('❌ Oura API error:', {
        status: response.status,
        statusText: response.statusText
      });
      throw new Error('Failed to fetch user data from Oura API');
    }

    const userData = await response.json();
    console.log('👤 User data received:', {
      id: userData.id,
      hasData: !!userData,
      timestamp: new Date().toISOString()
    });

    if (!userData.id) {
      console.error('❌ No user ID in response:', userData);
      throw new Error('No user ID received from Oura API');
    }

    const ouraUserId = userData.id;

    // Store or update user in database
    console.log('💾 Storing user data in database...');
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
    console.log('✅ Database operation successful:', {
      userId,
      operation: result.rowCount > 0 ? 'inserted' : 'updated'
    });

    // Create JWT token
    const token = jwt.sign(
      { 
        userId,
        ouraUserId
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    console.log('🎟️ JWT token created successfully');

    // Redirect to frontend with both tokens
    const redirectUrl = `${process.env.CLIENT_URL}/dashboard?token=${token}&oura_token=${accessToken}`;
    console.log('➡️ Redirecting to:', redirectUrl);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('❌ OAuth callback error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed&message=${encodeURIComponent(error.message)}`);
  }
};

module.exports = {
  handleOAuthCallback
}; 