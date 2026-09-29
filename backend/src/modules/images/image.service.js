const pool = require('../../config/db');
const { callImageAPI } = require('../../utils/imageApi');

async function generateImages(prompt, count, width, height, userId) {
  const tasks = Array.from({ length: count }, () =>
    callImageAPI({ prompt, width, height }).catch(err => ({ _error: err.message }))
  );
  const results = await Promise.all(tasks);

  const saved = [];
  const errors = [];
  let index = 1;

  for (const result of results) {
    if (result._error) {
      errors.push(result._error);
      continue;
    }
    const imageBuffer = result;
    const imageName = `img_${Date.now()}_${index}.png`;
    const { rows } = await pool.query(
      `INSERT INTO images (user_id, prompt, image_name, image_data, width, height, file_size)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, image_name, created_at`,
      [userId, prompt, imageName, imageBuffer, width, height, imageBuffer.length]
    );
    saved.push(rows[0]);
    index++;
  }

  return { saved, failed: errors.length, errors };
}

async function generateBulk(prompts, count, width, height, userId) {
  const allTasks = prompts.flatMap(prompt =>
    Array.from({ length: count }, () =>
      callImageAPI({ prompt, width, height })
        .then(buf => ({ prompt, buf }))
        .catch(err => ({ prompt, _error: err.message }))
    )
  );
  const results = await Promise.all(allTasks);

  const saved = [];
  const errors = [];
  let index = 1;

  for (const result of results) {
    if (result._error) {
      errors.push(result._error);
      continue;
    }
    const imageName = `img_${Date.now()}_${index}.png`;
    const { rows } = await pool.query(
      `INSERT INTO images (user_id, prompt, image_name, image_data, width, height, file_size)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, image_name, prompt, created_at`,
      [userId, result.prompt, imageName, result.buf, width, height, result.buf.length]
    );
    saved.push(rows[0]);
    index++;
  }

  return { saved, totalPrompts: prompts.length, failed: errors.length, errors };
}

async function getImages(userId) {
  const { rows } = await pool.query(
    `SELECT id, prompt, image_name, width, height, file_size, created_at
     FROM images WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}

async function getImageData(imageId, userId) {
  const { rows } = await pool.query(
    'SELECT image_data FROM images WHERE id = $1 AND user_id = $2',
    [imageId, userId]
  );
  return rows[0] || null;
}

async function deleteImage(imageId, userId) {
  const result = await pool.query(
    'DELETE FROM images WHERE id = $1 AND user_id = $2',
    [imageId, userId]
  );
  return result.rowCount > 0;
}

async function getImagesByIds(imageIds, userId) {
  const { rows } = await pool.query(
    `SELECT id, prompt, image_name, image_data FROM images
     WHERE id = ANY($1) AND user_id = $2`,
    [imageIds, userId]
  );
  return rows;
}

module.exports = { generateImages, generateBulk, getImages, getImageData, deleteImage, getImagesByIds };
