const mongoose = require("mongoose");
const Grid = require("gridfs-stream");
const Post = require("../models/post");
const jsdom = require("jsdom");
const axios = require("axios");
const { get_youtube } = require("../youtube");
const { omdb } = require("../omdb");

let currURL = "https://www.imdb.com/title/";

exports.get_all_movies = async (req, res, next) => {
  console.log("query ==", req.query.q);

  let outcome = {};
  let finalQuery = req.query.q;
  try {
	  if(!req.query.q.includes('trailer')){
		  finalQuery = req.query.q + "trailer";
	  }
		  
    const youtubeData = await get_youtube(finalQuery);
    console.log("youtubeData ==>", youtubeData);
    outcome.youtubeData = {};
    outcome.youtubeData = youtubeData;

    const imdbData = await omdb(req.query.q);
    outcome.imdbData = imdbData;

    console.log("imdbData ==>", imdbData);

    res.status(200).json({
      message: "GET requests media",
      data: outcome
    });
  } catch (err) {
    res.status(500).json({
      message: "GET requests media",
      error: err
    });
  }
};

exports.get_all_movie_trailers = async (req, res, next) => {
  console.log("currURL", currURL + req.query.title);

  axios
    .get(currURL + req.query.title)
    .then(response => {
      //console.log("response", response.data);

      const dom = new jsdom.JSDOM(response.data);
      let testLinks = dom.window.document.querySelector(
        "a[href^='/video/imdb']"
      );

      if (null !== testLinks.href) {
        res.status(200).json({
          message: "GET requests for for /trailers",
          trailer_url: "https://www.imdb.com/" + testLinks.href
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        message: "GET requests for /trailers",
        error: err
      });
    });
};

exports.get_all_posts_by_user = (req, res, next) => {
  if (undefined === req.query.parent) {
    return res.status(400).json({
      message: "Please specify a parent for posts"
    });
  }

  User.findOne({ username: req.query.parent })
    .then(user => {
      if (user) {
        Post.find({ parent: user.id })
          .select("-__v") //removes __v from mongo doc
          .exec()
          .then(docs => {
            console.log(docs);

            if (docs.length >= 0) {
              res.status(200).json({
                count: docs.length,
                message: "GET requests for /Postsss",
                createdPosts: docs
              });
            } else {
              res.status(200).json({
                message: "GET requests for /Posts",
                error: "No Entries Found"
              });
            }
          });
      } else {
        res.status(200).json({
          message: "GET requests for /Posts",
          error: "user doesn't exist"
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        message: "something went wrong!",
        error: err
      });
    });
};

exports.get_post_by_id = (req, res, next) => {
  const id = req.params.postId;

  Post.findById(id)
    .exec()
    .then(doc => {
      console.log(doc);

      if (doc) {
        res.status(200).json({
          message: "GET requests for /posts/" + id,
          document: doc
        });
      } else {
        res.status(404).json({
          message: "GET requests for /posts/" + id,
          error: "No Doc is present with passed ObjectId"
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        message: "something went wrong!",
        error: err
      });
    });
};

exports.get_post_image_by_id = (req, res, next) => {
  try {
    const id = req.params.postId;

    Post.findOne({ _id: id })
      .exec()
      .then(doc => {
        console.log("doc >>> ", doc);

        const imageFileId = doc.postImage.file_id;

        if (doc) {
          let gfs;
          mongoose.connect(
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

          const conn = mongoose.connection;
          conn.once("open", () => {
            gfs = Grid(conn.db, mongoose.mongo);

            gfs.collection("uploads");
            console.log("imageFileId >>>" + imageFileId);

            gfs.files.findOne(
              { _id: mongoose.Types.ObjectId(imageFileId) },
              (err, file) => {
                // Check if file
                if (!file || file.length === 0) {
                  return res.status(404).json({
                    err: "No file exists"
                  });
                }

                // Check if its an image
                if (
                  file.contentType === "image/jpeg" ||
                  file.contentType === "image/png"
                ) {
                  // Read output to browser
                  const readstream = gfs.createReadStream(file.filelink);
                  readstream.pipe(res);
                } else {
                  res.status(404).json({
                    err: "Not an image"
                  });
                }
              }
            );
          });
        } else {
          res.status(404).json({
            error: "No Post present with ObjectId : " + id
          });
        }
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          message: "Not able to get 'postImage.file_id' from Post with" + id,
          error: err
        });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "something went wrong!",
      error: err
    });
  }
};

exports.create_a_post = (req, res, next) => {
  console.log(" file ==> ", req.file);

  if (undefined === req.file) {
    return res.status(400).json({
      message: "Please specify a file to upload"
    });
  }

  if (undefined === req.body.parent) {
    return res.status(400).json({
      message: "Please specify a parent for posts"
    });
  }

  User.findById(req.body.parent)
    .then(user => {
      if (user) {
        const postId = new mongoose.Types.ObjectId();

        const postImageObj = {
          file_id: mongoose.Types.ObjectId(req.file.id),
          url: "/api/v1/posts/" + postId + "/image"
        };

        const post = new Post({
          _id: postId,
          parent: user.id,
          link: req.body.link,
          tags: req.body.tags,
          postImage: postImageObj
        });

        return post.save();
      } else {
        return res.status(404).json({
          message: "parentId is not provided or doesn't exist"
        });
      }
    })
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Created Post successfully",
        createdPost: {
          parent: req.body.parent,
          link: result.link,
          tags: result.tags,
          _id: result.id,
          postImage: {
            file_id: result.postImage.file_id,
            url: result.postImage.url
          },
          request: {
            type: "GET",
            url: "/api/v1/posts/" + result.id
          }
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        message: "something went wrong!",
        error: err
      });
    });
};

exports.update_a_post_by_id = (req, res, next) => {
  const id = req.params.postId;
  const updateOps = {};
  for (const [index, item] of req.body.entries()) {
    //.entries() provides index in for-of loop
    if (item.proplink && item.propValue) {
      updateOps[item.proplink] = item.propValue;
    } else {
      res.status(400).json({
        message:
          "'proplink' or 'propValue' fields are missing for record " +
          (index + 1)
      });
    }
  }
  console.log("updateOps ==>", updateOps);
  Post.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      console.log(result);
      if (result.nModified > 0) {
        res.status(200).json({
          message: "UPDATE requests for /posts/" + id,
          result: result
        });
      } else {
        res.status(200).json({
          message: "No fields updated for /posts/" + id
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        message: "something went wrong!",
        error: err
      });
    });
};

exports.delete_post_by_id = (req, res, next) => {
  const id = req.params.postId;

  Post.remove({ _id: id })
    .exec()
    .then(result => {
      console.log(result);
      if (result.deletedCount > 0) {
        res.status(200).json({
          message: "Post was removed"
        });
      } else {
        res.status(200).json({
          message: "No Post was removed, as postId doesn't exist."
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        message: "something went wrong!",
        error: err
      });
    });
};
