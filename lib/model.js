/**
 * model.js
 */
var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var ActionSchema = new Schema({
  type: String,
  x: Number,
  y: Number,
  color: String,
  sid: String
});

var PostSchema = new Schema({
  title: String,
  data: [ActionSchema],
  date: {type: Date, default: Date.now}
});

exports.Action = mongoose.model('Action', ActionSchema);
exports.Post = mongoose.model('Post', PostSchema);

mongoose.connect('mongodb:localhost/paintdb');


