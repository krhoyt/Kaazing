var express = require( 'express' );
var parse = require( 'parse' ).Parse;
var router = express.Router();

parse.initialize( 'ZBzdcXEpxqTcaig69vOIHhjw5OQ36SLzsWpOHhK8', 'Xt3X8AETCP7thbIjPk6SJKAcC8hPx0CPQZi7eIPw' );

/*
 * Account usage
 */

// GET - List
router.get( '/:uuid', function( req, res, next ) {
  var Account = parse.Object.extend( 'Account' );  
  var query = null;
  
  query = new parse.Query( Account );
  query.equalTo( 'token', req.params.uuid );
  query.first( {
    success: function( result ) {
      var Usage = parse.Object.extend( 'Usage' );
      var history = null;
      
      if( result == undefined )
      {
        res.send( 'ACCOUNT' );  
      } else {
        history = new parse.Query( Usage );
        history.equalTo( 'account', result );
        history.find( {
          success: function( results ) {
            var listing = null;
            
            listing = [];
            
            for( var r = 0; r < results.length; r++ )
            {
              listing.push( results[r].createdAt );
            }
            res.send( JSON.stringify( listing ) );
          },
          error: function( error ) {
            
          }
        } );
      }
    },
    error: function( error ) {
      
    }
  } );
} );

module.exports = router;
