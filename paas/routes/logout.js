var express = require( 'express' );
var router = express.Router();

/*
 * Account details
 */

// GET
router.get( '/', (req, res, next) => {
  res.clearCookie( 'account' );
  res.send( 'OK' );
} );

module.exports = router;
