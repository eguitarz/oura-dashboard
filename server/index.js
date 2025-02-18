require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2');
const { handleOAuthCallback } = require('./controllers/authController');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(passport.initialize());

// OAuth Configuration
passport.use(new OAuth2Strategy({
    authorizationURL: 'https://cloud.ouraring.com/oauth/authorize',
    tokenURL: 'https://api.ouraring.com/oauth/token',
    clientID: process.env.OURA_CLIENT_ID,
    clientSecret: process.env.OURA_CLIENT_SECRET,
    callbackURL: `${process.env.CLIENT_URL}/auth/oura/callback`,
    scope: ['daily', 'heartrate', 'personal', 'session', 'workout']
  },
  function(accessToken, refreshToken, profile, cb) {
    return cb(null, { accessToken, refreshToken });
  }
));

// Routes
app.get('/auth/oura', passport.authenticate('oauth2'));

app.get('/auth/oura/callback',
  passport.authenticate('oauth2', { failureRedirect: '/login' }),
  handleOAuthCallback
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 