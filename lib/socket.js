/**
 * Socket.IO
 */
var log = require('log4js').getLogger('lib/socket');
var connect = require('connect');
var model = require('./model');
var Post = model.Post;

exports.listen = function (app) {

  var io = require('socket.io').listen(app);
  var history = {};
  io.sockets.on('connection', function (socket) {
    log.info('conencted!');

    // Roomへ入室
    socket.on('room', function (data) {
      log.info('room');
      socket.join(data.room);
      socket.set('room', data.room, function () {
        var room = data.room;
        log.info('New user in room ' + room);

        // 新たに接続してきたクライアントに、historyを送信
        if (history[room] && history[room].length > 0) {
          log.info('Fount history in memory');
          for (var i=0; i<history[room].length; i++) {
            socket.emit(history[room][i].type, history[room][i].data);
          }
        } else {
          // データがない場合は、DBにアクセスしてみる
          log.info('No history in memory => Check DB');
          Post.findOne({_id: room}, function (err, post) {
            if (err) {
              log.error(err);
            } else {
              history[room] = [];
              for (var i=0; i<post.data.length; i++) {
                history[room].push({
                  type: post.data[i].type,
                  data: {
                    x: post.data[i].x,
                    y: post.data[i].y,
                    color: post.data[i].color,
                    sid: post.data[i].sid
                  }
                });
              }
              for (var i=0; i<history[room].length; i++) {
                socket.emit(history[room][i].type, history[room][i].data);
              }
            }
          });
        }
      });
    });

    // start, end
    socket.on('start', function (data) {
      log.info('start');
      socket.get('room', function (err, room) {
        var sid = _getSessionId(socket);
        io.sockets.to(room).emit('start', {
          x: data.x,
          y: data.y,
          color: data.color,
          sid: sid
        });
        if (!history[room]) {
          history[room] = [];
        }
        history[room].push({type: 'start', data: data});
      });
    });
    socket.on('end', function (data) {
      log.info('end');
      socket.get('room', function (err, room) {
        var sid = _getSessionId(socket);
        io.sockets.to(room).emit('end', {
          x: data.x,
          y: data.y,
          color: data.color,
          sid: sid
        });
        history[room].push({type: 'end', data: data});

        // 保存
        _savePost(room);

      });
    });

    // pos
    socket.on('pos', function (data) {
      log.info(data);
      socket.get('room', function (err, room) {
        var cookie = socket.handshake.headers.cookie;
        if (cookie) {
          var sid = connect.utils.parseCookie(cookie)['connect.sid'];
          log.info("sid = " + sid);
          if (sid) {
            var param = {
              x: data.x,
        y: data.y,
        color: data.color,
        sid: sid
            };
            io.sockets.to(room).emit('pos', param);
            history[room].push({type: 'pos', data: data});
          }
        }
      });
    });

    // clear
    socket.on('clear', function (data) {
      log.info('clear');
      socket.get('room', function (err, room) {
        var param = {};
        io.sockets.to(room).emit('clear', param);
        history[room] = [];
        _savePost(room);
      });
    });

    // disconnect
    socket.on('disconnect', function () {
      log.info('disconnect');
      socket.get('room', function (err, room) {
        socket.leave(room);
      });
    });

  });

  function _getSessionId(socket) {
    var cookie = socket.handshake.headers.cookie;
    if (cookie) {
      return connect.utils.parseCookie(cookie)['connect.sid'];
    } else {
      return undefined;
    }
  }

  function _savePost(room) {
    // 保存
    Post.findOne({_id: room}, function (err, post) {
      if (err || !post) {
        log.error(err);
      } else {
        post.data = [];
        for (var i=0; i<history[room].length; i++) { 
          post.data.push({
            type: history[room][i].type,
            x: history[room][i].data.x,
            y: history[room][i].data.y,
            color: history[room][i].data.color,
            sid: history[room][i].data.sid
          });
        }
        post.save(function (err) {
          if (err) {
            log.error(err);
          } else {
            log.info('Post saved!!!');
          }
        });
      }
    });
  }

};
