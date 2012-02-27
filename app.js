
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')

var log = require('log4js').getLogger('app.js');
log.setLevel('INFO');

var app = module.exports = express.createServer();

var MemoryStore = express.session.MemoryStore,
    sessionStore = new MemoryStore();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: 'secret',
    store: sessionStore
  }));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', routes.index);
app.get('/canvas/:id', routes.canvas);
app.post('/canvas/create', routes.create);

app.listen(process.env.PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);


// Socket.IO
require('./lib/socket').listen(app);

