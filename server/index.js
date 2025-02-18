require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2');
const session = require('express-session');
const { handleOAuthCallback } = require('./controllers/authController');
const ouraRoutes = require('./routes/ouraRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// OAuth Configuration
passport.use(new OAuth2Strategy({
    authorizationURL: 'https://cloud.ouraring.com/oauth/authorize',
    tokenURL: 'https://api.ouraring.com/oauth/token',
    clientID: process.env.OURA_CLIENT_ID,
    clientSecret: process.env.OURA_CLIENT_SECRET,
    callbackURL: 'http://localhost:5001/auth/oura/callback',
    scope: ['daily', 'heartrate', 'personal', 'session', 'workout']
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log('🔑 OAuth tokens received:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      timestamp: new Date().toISOString()
    });
    return cb(null, { accessToken, refreshToken });
  }
));

// Routes
app.use('/api/oura', ouraRoutes);

app.get('/auth/oura', (req, res, next) => {
  console.log('📤 Starting OAuth flow...');
  passport.authenticate('oauth2')(req, res, next);
});

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