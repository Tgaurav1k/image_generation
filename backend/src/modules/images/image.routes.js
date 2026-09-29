const { Router } = require('express');
const multer = require('multer');
const imageController = require('./image.controller');
const { verifyToken } = require('../../middleware/auth.middleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

router.use(verifyToken);

router.post('/enhance', imageController.enhance);
router.post('/generate', imageController.generate);
router.post('/generate-bulk', upload.single('file'), imageController.generateBulk);
router.get('/', imageController.listImages);
router.get('/:id/data', imageController.getImageData);
router.delete('/:id', imageController.deleteImage);
router.post('/download', imageController.download);

module.exports = router;
