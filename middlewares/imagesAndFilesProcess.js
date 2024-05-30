const multer = require("multer");
const path = require("path");
const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const fs = require("fs");
const storage = multer.memoryStorage();
const upload = multer({ storage });

exports.uploadMixOfImages = (fields) => upload.fields(fields);
exports.uploadSingleImage = (field) => upload.single(field);

// Ensure directories exist
const ensureDirectoryExistence = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

exports.saveFilesNameToDB = asyncHandler(async (req, res, next) => {
  try {
    ensureDirectoryExistence("uploads/images");
    ensureDirectoryExistence("uploads/videos");
    ensureDirectoryExistence("uploads/files");

    const hostname = `${req.protocol}://${req.get("host")}`;

    // Process images
    // if (req.files.images) {
    //   req.body.images = [];
    //   await Promise.all(
    //     req.files.images.map(async (img, index) => {
    //       const imageName = `order-${Date.now()}-${index + 1}.jpeg`;
    //       await sharp(img.buffer)
    //         .toFormat("jpeg")
    //         .toFile(`uploads/images/${imageName}`);
    //       const fullPath = `${hostname}/images/${imageName}`;
    //       req.body.images.push(fullPath);
    //     })
    //   );
    // }

    //Image(1) processing
    if (req.files.image && req.files.image.length > 0) {
      const imageFileName = `${Date.now()}-${slugify(
        req.files.image[0].originalname
      )}`;
      await new Promise((resolve, reject) => {
        fs.writeFile(
          `uploads/images/${imageFileName}`,
          req.files.image[0].buffer,
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      req.body.image = `${hostname}/images/${imageFileName}`;
    }
    //Image(2) processing
    if (req.files.image1 && req.files.image1.length > 0) {
      const imageFileName = `${Date.now()}-${slugify(
        req.files.image1[0].originalname
      )}`;
      await new Promise((resolve, reject) => {
        fs.writeFile(
          `uploads/images/${imageFileName}`,
          req.files.image1[0].buffer,
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      req.body.image1 = `${hostname}/images/${imageFileName}`;
    }
    //Image(3) processing
    if (req.files.image2 && req.files.image2.length > 0) {
      const imageFileName = `${Date.now()}-${slugify(
        req.files.image2[0].originalname
      )}`;
      await new Promise((resolve, reject) => {
        fs.writeFile(
          `uploads/images/${imageFileName}`,
          req.files.image2[0].buffer,
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      req.body.image2 = `${hostname}/images/${imageFileName}`;
    }
    // Process video
    if (req.files.video && req.files.video.length > 0) {
      const videoFileName = `${Date.now()}-${slugify(
        req.files.video[0].originalname
      )}`;
      await new Promise((resolve, reject) => {
        fs.writeFile(
          `uploads/videos/${videoFileName}`,
          req.files.video[0].buffer,
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      req.body.video = `${hostname}/videos/${videoFileName}`;
    }

    // Process other files
    if (req.files.file && req.files.file.length > 0) {
      const fileFileName = `${Date.now()}-${slugify(
        req.files.file[0].originalname
      )}`;
      await new Promise((resolve, reject) => {
        fs.writeFile(
          `uploads/files/${fileFileName}`,
          req.files.file[0].buffer,
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      req.body.file = `${hostname}/files/${fileFileName}`;
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
});
