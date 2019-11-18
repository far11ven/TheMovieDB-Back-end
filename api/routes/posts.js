const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const crypto = require("crypto");

const multer = require("multer");

const PostController = require("../controllers/postController");
const GridFsStorage = require("multer-gridfs-storage");
//simple implementation
// const storage = multer.diskStorage({
//   destination: function(req, file, callback) {
//     callback(null, "./uploads/");
//   },
//   filename: function(req, file, callback) {
//     callback(null, file.originalname);
//   }
// });
const checkAuth = require("../middleware/auth");
const currTimestamp = Date.now();
const connection = mongoose.connect(
  "mongodb+srv://" +
    process.env.MONGO_USER +
    ":" +
    process.env.MONGO_USER_PASSWORD +
    "@cluster0-n1cyt.gcp.mongodb.net/" +
    process.env.MONGO_DB +
    "?retryWrites=true",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

const storage = new GridFsStorage({
  db: connection,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = file.originalname + "_" + currTimestamp;
        const fileInfo = {
          filename: filename,
          bucketName: "uploads"
        };
        resolve(fileInfo);
      });
    });
  }
});

const fileFilter = (req, file, callback) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    callback(null, true);
  } else {
    callback(new Error("postImage is not a valid file type"), true);
  }
};
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

router.get("/search", PostController.get_all_movies);
router.get("/trailers", PostController.get_all_movie_trailers);

router.get("/", PostController.get_all_posts_by_user);

router.get("/:postId", PostController.get_post_by_id);

router.get("/:postId/image", PostController.get_post_image_by_id);

router.post(
  "/",
  checkAuth,
  upload.single("postImage"),
  PostController.create_a_post
);

router.patch("/:postId", checkAuth, PostController.update_a_post_by_id);

router.delete("/:postId", checkAuth, PostController.delete_post_by_id);
module.exports = router;
