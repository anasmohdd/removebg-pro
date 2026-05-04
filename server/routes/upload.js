/**
 * routes/upload.js
 * Handles image upload validation and storage of the original image.
 * Returns a temporary upload ID used by /remove-bg.
 */

const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const authMiddleware = require("../middleware/auth");

// ─── Multer config ────────────────────────────────────────────────────────────
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 12 * 1024 * 1024; // 12 MB (remove.bg limit)

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `orig_${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Unsupported file type. Please upload a JPEG, PNG, WebP, or GIF image."
        )
      );
    }
  },
});

// ─── POST /api/upload ─────────────────────────────────────────────────────────
router.post(
  "/",
  authMiddleware,
  (req, res, next) => {
    // Wrap multer to handle its errors cleanly
    upload.single("image")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            error: "File is too large. Maximum size is 12 MB.",
          });
        }
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided." });
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    res.json({
      message: "Image uploaded successfully.",
      filename: req.file.filename,
      originalUrl: fileUrl,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  }
);

module.exports = router;
