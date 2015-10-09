/////////////////////////////////////////////////////////////////////////////////////////////
// REQUIRE ALL THE MODULES AND MIDDLEWARES WE NEED
/////////////////////////////////////////////////////////////////////////////////////////////

const koa = require('koa'); // Require the koa micro framework

const app = koa(); // Create the koa app

const winston = require('winston'); // Require the winston middleware for console logs
const Router = require('koa-router'); // Require the koa-router middleware
const views = require('koa-views'); // Require the koa-view middleware
const koaResponseTime = require('koa-response-time'); // Require koa-response-time
const Waterline = require('waterline'); // Require the Waterline
const path = require('path'); // Require path to use path.resolve
const bodyparser = require('koa-bodyparser'); // Require koa-bodyparser
const favicon = require('koa-favicon'); // Require koa-favicon
const diskAdapter = require('sails-disk'); // Require the sails-disk module for the local database
const serve = require('koa-static-folder'); // Require the koa static folder middleware


const LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');


/////////////////////////////////////////////////////////////////////////////////////////////
// INSTANTIATE A NEW WINSTON LOGGER
/////////////////////////////////////////////////////////////////////////////////////////////

const log = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            level: 'debug',
            colorize: 'level'
        })
    ]
});

/////////////////////////////////////////////////////////////////////////////////////////////
// CREATE PROCESS RULES
/////////////////////////////////////////////////////////////////////////////////////////////

// Handle 'SIGINT' events
process.on('SIGINT', function () {
    process.exit(0);
});

// Handle 'SIGTERM' events
process.on('SIGTERM', function () {
    process.exit(1);
});

// Log a warning on 'exit' events.
process.on('exit', function () {
    log.warn('Exiting...');
});

// Make sure the configured port is not already used
// by an application or a service
process.on("uncaughtException", function(err) {
   if (err.errno === 'EADDRINUSE') {
       log.error('Port 8080 already in use');
       process.exit(1);
   }
});

/////////////////////////////////////////////////////////////////////////////////////////////
// USE OF THE MIDDLEWARES
/////////////////////////////////////////////////////////////////////////////////////////////

app.use(koaResponseTime()); // Use the response time middleware
app.use(bodyparser({encode:'utf-8'})); // Use the body parser middleware

// Use the koa view middleware
app.use(views('views', {
    map: {
        ejs: 'ejs'
    }
}));

app.use(favicon(path.resolve(__dirname, 'favicon.ico'))); // Use the favicon middleware

// Create logs for every request method
app.use(function *(next) {
    const start = new Date();
    yield next;
    const time = new Date() - start;
    log.warn(this.method + ' ' + this.url + ' (' + time + ')');
});

// Define a static folder to call the style.css in the views
app.use(serve('./styles'));

/////////////////////////////////////////////////////////////////////////////////////////////
// WATERLINE SET UP
/////////////////////////////////////////////////////////////////////////////////////////////

// INSTANTIATE A NEW INSTANCE OF THE ORM
var orm = new Waterline();

// BUILD A CONFIG OBJECT
var config = {
    adapters: {
        disk: diskAdapter
    },
    // Build Connections Config
    // Setup connections using the named adapter configs
    connections: {
        myLocalDisk: {
            adapter: 'disk'
        }
    },
    defaults: {
        migrate: 'alter'
    }
};

var user = require('./models/User.js');
var Msg = require('./models/Msg.js');

orm.loadCollection(Waterline.Collection.extend(user)); // Load the user model into the ORM
orm.loadCollection(Waterline.Collection.extend(Msg)); // Load the msg model into the ORM

// START WATERLINE PASSING ADAPTERS IN
orm.initialize(config, function (err, models) {
    if (err) {
        console.log('Error with ORM');
        process.exit(1);
    }
});

global.User = orm.collections.user; // Define a global variable
global.Msg = orm.collections.message; // Define a global variable


/////////////////////////////////////////////////////////////////////////////////////////////
// MANAGEMENT OF THE ROUTES
/////////////////////////////////////////////////////////////////////////////////////////////

// Instantiate a new router
const router = new Router();

router.post('/login', require('./controllers/Login').login);
router.post('/send', require('./controllers/Chat').createMsg);

router.get('/', require('./controllers/User').register);

router.post('/create', require('./controllers/User').create);

router.get('/chat', require('./controllers/Chat').chat);

/////////////////////////////////////////////////////////////////////////////////////////////
// LAST RULES OF THE SERVER.JS
/////////////////////////////////////////////////////////////////////////////////////////////

// Log a warning when server starts
log.info('Environment : ' + (app.env || process.env.NODE_ENV || 'development'));
log.info('Directory : ' + process.cwd()); // ou + process.cwd() path.resolve(__dirname)
log.info('Process ID : ' + process.pid); // ou process.getgid()

// Allow all koa-router methods
app.use(router.routes());
app.use(router.allowedMethods());

// Listen
global.io = require('socket.io').listen(app.listen(1337)); // Require the socket.io real time engine

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
      localStorage.setItem("message",msg)
  });

});
exports.io = io;
