require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { initDB } = require('./models/database');
const { fixUrls } = require('./migrations/fix-urls');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const guestRoutes = require('./routes/guests');
const configRoutes = require('./routes/config');
const uploadRoutes = require('./routes/uploads');
const rsvpRoutes = require('./routes/rsvp');
const cardRoutes = require('./routes/cards');
const publicRoutes = require('./routes/public');
const userRoutes = require('./routes/users');
const suggestionRoutes = require('./routes/suggestions');
const registrationRoutes = require('./routes/registrations');
const registerRoutes = require('./routes/register');
const { publicRouter: plansPublicRoutes, adminRouter: plansAdminRoutes } = require('./routes/plans');
const paymentsRoutes = require('./routes/payments');
const { purchasesRouter: adminPurchasesRoutes, eventsAdminRouter: adminEventsRoutes, adminGeneralRouter: adminGeneralRoutes } = require('./routes/admin-purchases');
const myEventsRoutes = require('./routes/my-events');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for rate limiting behind Docker/Nginx
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: [process.env.FRONTEND_URL, 'http://localhost:4200'], credentials: true }));

// Stripe webhook needs raw body for HMAC signature verification.
// Must be registered BEFORE express.json() middleware.
app.use('/api/payments/webhook/stripe', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// HTTP request logging (skip health checks)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', {
  skip: (req) => req.url === '/health'
}));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
app.use(limiter);

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/config', configRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/rsvp', rsvpRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/users', userRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/register', registerRoutes);
app.use('/api/plans', plansPublicRoutes);
app.use('/api/admin/plans', plansAdminRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/admin/purchases', adminPurchasesRoutes);
app.use('/api/admin/events', adminEventsRoutes);
app.use('/api/admin', adminGeneralRoutes);
app.use('/api/my-events', myEventsRoutes);
app.use('/api/profile', profileRoutes);

app.get('/health', async (req, res) => {
  try {
    const { getDB } = require('./models/database');
    await getDB().query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString(), uptime: process.uptime() });
  } catch (err) {
    res.status(503).json({ status: 'degraded', db: 'disconnected', error: err.message, timestamp: new Date().toISOString() });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

(async () => {
  await initDB();
  await fixUrls();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();

module.exports = app;
