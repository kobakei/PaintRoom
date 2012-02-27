
/*
 * GET home page.
 */

var log = require('log4js').getLogger('routes/index.js');
log.setLevel("INFO");

var model = require('../lib/model');
var Post = model.Post;

var APP_TITLE = "PaintRoom";

exports.index = function (req, res) {
  Post.find({}, function (err, posts) {
    if (err) {
      res.send(err);
    } else {
      res.render('index', {
        title: APP_TITLE,
        posts: posts
      })
    }
  });
};

exports.canvas = function (req, res) {
  if (req.params.id) {
    Post.findOne({_id: req.params.id}, function (err, post) {
      if (err || !post) {
        res.send(err);
      } else {
        res.render('canvas', {
          title: APP_TITLE,
          post: post
        });
      }
    });
  }
};

exports.create = function (req, res) {
  if (req.body && req.body.title) {
    var post = new Post();
    post.title = req.body.title;
    post.save(function (err) {
      if (err) {
        res.send(err);
      } else {
        res.redirect('/');
      }
    });
  }
};
