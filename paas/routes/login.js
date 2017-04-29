var express = require( 'express' );
var parse = require( 'parse' ).Parse;
var router = express.Router();

parse.initialize( 'ZBzdcXEpxqTcaig69vOIHhjw5OQ36SLzsWpOHhK8', 'Xt3X8AETCP7thbIjPk6SJKAcC8hPx0CPQZi7eIPw' );

/*
 * Login
 */

// GET
router.get( '/', (req, res, next) => {
  var Account = parse.Object.extend( 'Account' );    
  var query = null;
  
  query = new parse.Query( Account );
  query.equalTo( 'email', req.query.email );
  query.first( {
    success(result) {
      if( result == undefined )
      {
        res.send( 'ACCOUNT' );  
      } else {
        if( result.get( 'password' ) != req.query.password )
        {
          res.send( 'PASSWORD' );  
        } else {
          if( result.get( 'verification' ).trim().length != 0 )
          {
            res.send( 'VERIFY' );  
          } else {
            res.cookie( 'account', {
              id: result.id,
              company: result.get( 'company' ),
              createdAt: result.createdAt,
              email: result.get( 'email' ),
              name: result.get( 'name' ),
              tags: result.get( 'tags' ),            
              token: result.get( 'token' )
            } );
            res.send( 'OK' );  
          }
        }
      }
    },
    error(error) {
      res.send( 'ERROR:' + error.message );
    }
  } );
} );

module.exports = router;
