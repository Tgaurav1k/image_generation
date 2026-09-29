const imageService = require('./image.service');
const pool = require('../../config/db');
const { buildDownloadZip } = require('../../utils/zipBuilder');
const { parseExcelPrompts } = require('../../utils/excelParser');
const { enhancePrompt } = require('../../utils/promptEnhancer');

async function generate(req, res, next) {
  try {
    const { prompt, count = 1, width = 512, height = 512 } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    const n = Math.min(Math.max(parseInt(count) || 1, 1), 20);
    const sanitizeSize = (v) => {
      const rounded = Math.round(v / 16) * 16;
      return Math.min(Math.max(rounded, 512), 2048);
    };
    const w = sanitizeSize(parseInt(width) || 512);
    const h = sanitizeSize(parseInt(height) || 512);

    const shouldEnhance = req.body.enhance === true || req.body.enhance === 'true';
    let finalPrompt = prompt.trim();
    let enhancedPrompt = null;

    if (shouldEnhance) {
      enhancedPrompt = await enhancePrompt(finalPrompt);
      finalPrompt = enhancedPrompt;
    }

    const result = await imageService.generateImages(finalPrompt, n, w, h, req.user.id);

    await pool.query(
      `INSERT INTO activity_log (user_id, action, meta) VALUES ($1, 'generate_single', $2)`,
      [req.user.id, JSON.stringify({ requested: n, succeeded: result.saved.length, failed: result.failed, enhanced: shouldEnhance })]
    );

    const response = { images: result.saved, failed: result.failed, errors: result.errors };
    if (enhancedPrompt) response.enhanced_prompt = enhancedPrompt;
    res.json(response);
  } catch (err) {
    next(err);
  }
}

async function generateBulk(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a valid .xlsx or .xls file' });
    }

    const ext = req.file.originalname.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls'].includes(ext)) {
      return res.status(400).json({ error: 'Please upload a valid .xlsx or .xls file' });
    }

    const prompts = parseExcelPrompts(req.file.buffer);
    if (prompts.length === 0) {
      return res.status(400).json({ error: 'No valid prompts found in the uploaded file' });
    }

    const count = Math.min(Math.max(parseInt(req.body.count) || 1, 1), 20);
    const sanitizeSize = (v) => {
      const rounded = Math.round(v / 16) * 16;
      return Math.min(Math.max(rounded, 512), 2048);
    };
    const width = sanitizeSize(parseInt(req.body.width) || 512);
    const height = sanitizeSize(parseInt(req.body.height) || 512);
    const shouldEnhance = req.body.enhance === true || req.body.enhance === 'true';

    let finalPrompts = prompts;
    if (shouldEnhance) {
      finalPrompts = await Promise.all(prompts.map((p) => enhancePrompt(p)));
    }

    const result = await imageService.generateBulk(finalPrompts, count, width, height, req.user.id);

    await pool.query(
      `INSERT INTO activity_log (user_id, action, meta) VALUES ($1, 'generate_bulk', $2)`,
      [req.user.id, JSON.stringify({
        prompts: result.totalPrompts,
        per_prompt_count: count,
        succeeded: result.saved.length,
        failed: result.failed,
        enhanced: shouldEnhance,
      })]
    );

    res.json({
      total_prompts: result.totalPrompts,
      total_images: result.saved.length,
      images: result.saved,
      failed: result.failed,
    });
  } catch (err) {
    next(err);
  }
}

async function listImages(req, res, next) {
  try {
    const images = await imageService.getImages(req.user.id);
    res.json({ images });
  } catch (err) {
    next(err);
  }
}

async function getImageData(req, res, next) {
  try {
    const image = await imageService.getImageData(req.params.id, req.user.id);
    if (!image) return res.status(404).json({ error: 'Image not found' });
    res.setHeader('Content-Type', 'image/png');
    res.send(image.image_data);
  } catch (err) {
    next(err);
  }
}

async function deleteImage(req, res, next) {
  try {
    const deleted = await imageService.deleteImage(req.params.id, req.user.id);
    if (!deleted) return res.status(404).json({ error: 'Image not found' });

    await pool.query(
      `INSERT INTO activity_log (user_id, action, meta) VALUES ($1, 'image_deleted', $2)`,
      [req.user.id, JSON.stringify({ image_id: req.params.id })]
    );

    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
}

async function download(req, res, next) {
  try {
    const { image_ids } = req.body;
    if (!Array.isArray(image_ids) || image_ids.length === 0) {
      return res.status(400).json({ error: 'Select at least one image to download' });
    }

    const images = await imageService.getImagesByIds(image_ids, req.user.id);
    if (images.length === 0) {
      return res.status(404).json({ error: 'No images found' });
    }

    await pool.query(
      `INSERT INTO activity_log (user_id, action, meta) VALUES ($1, 'download', $2)`,
      [req.user.id, JSON.stringify({ image_ids })]
    );

    if (images.length === 1) {
      const img = images[0];
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="${img.image_name}"`);
      return res.send(img.image_data);
    }

    await buildDownloadZip(images, res);
  } catch (err) {
    next(err);
  }
}

async function enhance(req, res, next) {
  try {
    const { prompt } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    const enhanced = await enhancePrompt(prompt.trim());
    res.json({ original: prompt.trim(), enhanced });
  } catch (err) {
    next(err);
  }
}

module.exports = { generate, generateBulk, listImages, getImageData, deleteImage, download, enhance };
