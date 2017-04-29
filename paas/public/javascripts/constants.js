var COOKIE_ACCOUNT = 'account';
var COOKIE_VERIFY = 'verify';

var ERROR_ACCOUNT_EXISTS = 'EXISTS';
var ERROR_ACCOUNT_MISSING = 'ACCOUNT';
var ERROR_PASSWORD_INCORRECT = 'PASSWORD';
var ERROR_VERIFY_ALREADY = 'ALREADY';
var ERROR_VERIFY_MISSING = 'MISSING';
var ERROR_VERIFY_REQUIRED = 'VERIFY';

var FORWARD_DELAY = 3000;

var MESSAGE_ACCOUNT_COMPLETE = 'Account details updated.';
var MESSAGE_ACCOUNT_EXISTS = 'An account with that email already exists.';
var MESSAGE_ACCOUNT_MISSING = 'Account not found.';
var MESSAGE_CONFIRM_REQUIRED = 'Password confirmation required.';
var MESSAGE_EMAIL_CHECK = 'Check your email to verify account.';
var MESSAGE_EMAIL_FORMAT = 'Invalid email format.';
var MESSAGE_EMAIL_REQUIRED = 'Email address is required.';
var MESSAGE_PASSWORD_INCORRECT = 'Account details do not match.';
var MESSAGE_PASSWORD_MATCH = 'Password and confirmation do not match.';
var MESSAGE_PASSWORD_REQUIRED = 'Password required.';
var MESSAGE_VERIFY_ALREADY = 'That account has already been verified.';
var MESSAGE_VERIFY_COMPLETE = 'Account verified - you may now login.';
var MESSAGE_VERIFY_MISSING = 'That account does not exist.';
var MESSAGE_VERIFY_REQUIRED = 'Account not verified - check your email.';

var PATH_ACCOUNT = '/account';

var PATH_API_ACCOUNT = '/api/account';
var PATH_API_LOGIN = '/api/login';
var PATH_API_USAGE = '/api/usage';

var SUCCESS = 'OK';

function clean( func )
{
  // Clean up XHR for next use
  xhr.removeEventListener( 'load', func );
  xhr = null;  
}

// Generate a UUID for email verification
function generateUUID() 
{
  var now = Date.now();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, c => {
    var r = ( now + Math.random() * 16 ) % 16 | 0;
    now = Math.floor( now / 16 );
    return ( c == 'x' ? r : ( r&0x3 | 0x8 ) ).toString( 16 );
  } );
  return uuid;
};  
