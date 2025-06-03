const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const oauthConfig = require('../config/oauth');

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: oauthConfig.google.clientID,
  clientSecret: oauthConfig.google.clientSecret,
  callbackURL: oauthConfig.google.callbackURL
}, (accessToken, refreshToken, profile, done) => {
  // Save user or handle login logic here
  return done(null, profile);
}));

// Serialize and deserialize user
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Auth routes
router.get('/google', passport.authenticate('google', { 
  scope: oauthConfig.google.scope 
}));

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/login',
    failureMessage: true
  }),
  (req, res) => {
    res.redirect('/');
  }
);

// Error handling route
router.get('/error', (req, res) => {
  res.render('error', { 
    message: 'Authentication Error', 
    error: req.session.messages || [] 
  });
});

module.exports = router;
