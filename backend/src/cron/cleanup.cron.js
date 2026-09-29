const cron = require('node-cron');
const pool = require('../config/db');

function startCleanupCron() {
  cron.schedule('0 0 * * *', async () => {
    try {
      const result = await pool.query(
        `DELETE FROM images WHERE created_at < NOW() - INTERVAL '7 days'`
      );
      await pool.query(
        `INSERT INTO activity_log (action, meta) VALUES ('cron_cleanup', $1)`,
        [JSON.stringify({ deleted_count: result.rowCount })]
      );
      console.log(`[CRON] Deleted ${result.rowCount} old images`);
    } catch (err) {
      console.error('[CRON] Cleanup failed:', err.message);
    }
  });
  console.log('[CRON] Cleanup job scheduled (daily at midnight)');
}

module.exports = { startCleanupCron };
