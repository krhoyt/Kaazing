var express = require( 'express' );
var parse = require( 'parse' ).Parse;
var router = express.Router();

parse.initialize( 'ZBzdcXEpxqTcaig69vOIHhjw5OQ36SLzsWpOHhK8', 'Xt3X8AETCP7thbIjPk6SJKAcC8hPx0CPQZi7eIPw' );  

// Landing
router.get( '/', function( req, res, next ) {
  res.sendFile( 'index.html', {
    root: __dirname + '/../public/'  
  } );
} );

// Account management
router.get( '/account', function( req, res, next ) {
  if( req.cookies.account === undefined )
  {
    res.sendFile( 'index.html', {
      root: __dirname + '/../public/'  
    } );    
  } else {
    res.sendFile( 'account.html', {
      root: __dirname + '/../public/'  
    } );    
  }
} );

// Verify
router.get( '/verify/:uuid', function( req, res, next ) {
  var Account = parse.Object.extend( 'Account' );  
  var query = null;
  
  query = new parse.Query( Account );
  query.equalTo( 'verification', req.params.uuid );
  query.first( {
    success: function( result ) {
      var check = null;
      
      if( result == undefined )
      {
        check = new parse.Query( Account );
        check.equalTo( 'token', req.params.uuid );
        check.first( {
          success: function( result ) {
            if( result == undefined )
            {
              res.cookie( 'verify', 'MISSING' );   
            } else {
              res.cookie( 'verify', 'ALREADY' );    
            }
            
            res.sendFile( 'verify.html', {
              root: __dirname + '/../public/'  
            } );                           
          },
          error: function( error ) {
            res.render( 'error', {
              message: error.message,
              error: {}
            } );            
          }
        } );
      } else {
        result.set( 'token', result.get( 'verification' ) );
        result.set( 'verification', '' );
        result.save( null, {
          success: function( result ) {
            res.cookie( 'verify', 'OK' );   
    
            res.sendFile( 'verify.html', {
              root: __dirname + '/../public/'  
            } );                
          },
          error: function( error ) {
            res.render( 'error', {
              message: error.message,
              error: {}
            } );            
          }
        } );
      }
    }
  } );
} );

module.exports = router;
