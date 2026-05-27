require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');
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

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: [process.env.FRONTEND_URL, 'http://localhost:4200'], credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

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
