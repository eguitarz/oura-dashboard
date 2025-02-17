require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// OAuth Configuration
passport.use(new OAuth2Strategy({
    authorizationURL: 'https://cloud.ouraring.com/oauth/authorize',
    tokenURL: 'https://api.ouraring.com/oauth/token',
    clientID: process.env.OURA_CLIENT_ID,
    clientSecret: process.env.OURA_CLIENT_SECRET,
    callbackURL: '/auth/oura/callback'
  },
  function(accessToken, refreshToken, profile, cb) {
    // Store user tokens and handle authentication
    return cb(null, { accessToken, refreshToken });
  }
));

// Routes
app.get('/auth/oura', passport.authenticate('oauth2'));

app.get('/auth/oura/callback',
  passport.authenticate('oauth2', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 