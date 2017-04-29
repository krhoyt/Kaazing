var express = require( 'express' );
var path = require( 'path' );
var favicon = require( 'serve-favicon' );
var logger = require( 'morgan' );
var cookieParser = require( 'cookie-parser' );
var bodyParser = require( 'body-parser' );

var account = require( './routes/account' );
var landing = require( './routes/index' );
var login = require( './routes/login' );
var logout = require( './routes/logout' );
var usage = require( './routes/usage' );

var app = express();

// View engine
app.set( 'views', path.join( __dirname, 'views' ) );
app.set( 'view engine', 'jade' );

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use( logger( 'dev' ) );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: false } ) );
app.use( cookieParser() );
app.use( express.static( path.join( __dirname, 'public' ) ) );

app.use( '/', landing );
app.use( '/api/account', account );
app.use( '/api/login', login );
app.use( '/api/logout', logout );
app.use( '/api/usage', usage );

// 404
app.use( (req, res, next) => {
  var err = new Error( 'Not Found' );
  err.status = 404;
  next( err );
} );

/*
 * Error handlers
 */

// Development error handler
// Will print stack trace
if( app.get( 'env' ) === 'development' ) 
{
  app.use( (err, req, res, next) => {
    res.status( err.status || 500 );
    res.render( 'error', {
      message: err.message,
      error: err
    } );
  } );
}

// Production error handler
// No stack traces
app.use( (err, req, res, next) => {
  res.status( err.status || 500 );
  res.render( 'error', {
    message: err.message,
    error: {}
  } );
} );

module.exports = app;
