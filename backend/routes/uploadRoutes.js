const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }

    cb(null, true);
  },
});

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'rs-mani-cafe/menu',
        resource_type: 'image',
        transformation: [
          { width: 800, height: 600, crop: 'fill' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(fileBuffer);
  });
};

// @route POST /api/upload/menu-image
router.post(
  '/menu-image',
  protect,
  adminOnly,
  upload.single('image'),
  async (req, res) => {
    try {
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        return res.status(503).json({
          message: 'Cloudinary is not configured',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: 'Image file is required',
        });
      }

      const result = await uploadToCloudinary(req.file.buffer);

      res.status(201).json({
        imageUrl: result.secure_url,
        publicId: result.public_id,
      });
    } catch (err) {
      console.error('[CLOUDINARY UPLOAD ERROR]', err);
      res.status(500).json({
        message: err.message || 'Image upload failed',
      });
    }
  }
);

module.exports = router;