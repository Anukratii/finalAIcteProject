require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const multer = require('multer');

const fitnessRouter = require('./routes/fitness');
const nutritionRouter = require('./routes/nutrition');
const motivationRouter = require('./routes/motivation');
const speechRouter = require('./routes/speech');
const chatRouter = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Security & logging middleware ─────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"]
    }
  }
}));
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// ── Static files ──────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/fitness', fitnessRouter);
app.use('/api/nutrition', nutritionRouter);
app.use('/api/motivation', motivationRouter);
app.use('/api/speech', speechRouter);
app.use('/api/chat', chatRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AI Fitness Buddy',
    model: process.env.IBM_GRANITE_MODEL_ID || 'ibm/granite-3-8b-instruct',
    timestamp: new Date().toISOString()
  });
});

// ── SPA fallback ──────────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🏋️  AI Fitness Buddy running at http://localhost:${PORT}`);
  console.log(`📡  IBM Granite model : ${process.env.IBM_GRANITE_MODEL_ID}`);
  console.log(`🌐  watsonx.ai URL    : ${process.env.IBM_WATSON_X_URL}\n`);
});
