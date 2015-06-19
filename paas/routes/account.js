var express = require( 'express' );
var parse = require( 'parse' ).Parse;
var router = express.Router();
var sendgrid  = require( 'sendgrid' )( 'krhoyt', 'MP4dhBTbgpR2Ei' );

parse.initialize( 'ZBzdcXEpxqTcaig69vOIHhjw5OQ36SLzsWpOHhK8', 'Xt3X8AETCP7thbIjPk6SJKAcC8hPx0CPQZi7eIPw' );

/*
 * Account details
 */

// POST - Create
router.post( '/', function( req, res, next ) {
  var Account = parse.Object.extend( 'Account' );  
  var query = null;
  
  query = new parse.Query( Account );
  query.equalTo( 'email', req.body.email );
  query.first( {
    success: function( result ) {
      var account = null;
      
      if( result == undefined ) 
      {
        account = new Account();
        account.save( {
          company: req.body.company,
          email: req.body.email,
          name: req.body.name,
          password: req.body.password,
          verification: req.body.verification
        }, {
          success: function( result ) {
            var payload = null;
            
            payload = {
              to: req.body.email,
              from: 'kevin.hoyt@kaazing.com',
              subject: 'Kaazing Sandbox Verification',
              text: 'Welcome to Kaazing Sandbox! ' +
                    'Please click on the following URL to verify your account. ' +        
                    'http://localhost:3000/verify/' + req.body.verification
            };
            
            sendgrid.send( payload, function( err, json ) {
              if( err ) 
              {
                res.send( 'ERROR: ' + err );  
              }
            } );
            
            res.send( 'OK' );
          },
          error: function( result, error ) {
            res.send( 'ERROR: ' + error.message );
          }
        } );        
      } else {
        res.send( 'EXISTS' );
      }
    }
  } );
} );

// PUT - Update
router.put( '/', function( req, res, next ) {
  var Account = parse.Object.extend( 'Account' );  
  var query = null;
  
  query = new parse.Query( Account );
  query.equalTo( 'objectId', req.body.id );
  query.first( {
    success: function( result ) {
      if( result === undefined )
      {
        res.send( 'ACCOUNT' ); 
      } else {
        result.set( 'name', req.body.name );
        result.set( 'company', req.body.company );
        result.set( 'email', req.body.email );
        
        if( result.get( 'password' ) != req.body.password )
        {
          result.set( 'password' ) = req.body.password;  
        }
        
        result.save( null, {
          success: function( result ) {
            res.send( 'OK' );
          }, 
          error: function( error ) {
            res.send( 'ERROR: ' + error.message );                    
          }
        } );
      }
    },
    error: function( error ) {
      res.send( 'ERROR: ' + error.message );      
    }
  } );  
} );

module.exports = router;
