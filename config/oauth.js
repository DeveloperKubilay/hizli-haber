module.exports = {
  google: {
    clientID: '866369173209-9ridifjkd5a7v3kl8hb8g0j9hucn93q4.apps.googleusercontent.com',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET_HERE',
    callbackURL: process.env.CALLBACK_URL || 'http://localhost:3000/auth/google/callback',
    scope: ['profile', 'email']
  }
};
