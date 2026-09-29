const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const pool = require('./config/db');
const { ensureBootstrapUsers } = require('./db/bootstrapUsers');
const { errorHandler } = require('./middleware/error.middleware');
const authRoutes = require('./modules/auth/auth.routes');
const imageRoutes = require('./modules/images/image.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const { startCleanupCron } = require('./cron/cleanup.cron');

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (env.FRONTEND_ORIGINS.includes(origin)) return callback(null, true);
    callback(null, false);
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/admin', adminRoutes);

const distPath = path.join(__dirname, '../public');
if (env.NODE_ENV === 'production' && fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // Express 5 / path-to-regexp rejects app.get('*', …). Fallback after static.
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use(errorHandler);

async function start() {
  try {
    await ensureBootstrapUsers(pool);
  } catch (err) {
    console.error('[BOOT] ensureBootstrapUsers failed:', err.message);
  }

  app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Running on port ${env.PORT}`);
    startCleanupCron();
  });
}

start();
