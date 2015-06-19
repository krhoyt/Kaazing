var xhr = null;

function doLoginClick()
{ 
  var email = null;
  var password = null;
  
  // Email
  email = document.querySelector( '.login .email' );
  
  // Required
  if( email.value.trim().length === 0 )
  {
    alert( MESSAGE_EMAIL_REQUIRED );
    email.focus();
    return;
  }
  
  // Format
  if( email.value.indexOf( '.' ) === -1 || email.value.indexOf( '@' ) === -1 )
  {
    alert( MESSAGE_EMAIL_FORMAT );
    email.focus();
    return;
  }
  
  // Password
  password = document.querySelector( '.login .password' );
  
  // Required
  if( password.value.trim().length === 0 )
  {
    alert( MESSAGE_PASSWORD_REQUIRED );  
    password.focus();
    return;
  }  
  
  // Login
  xhr = new XMLHttpRequest();
  xhr.addEventListener( 'load', doLoginLoad );
  xhr.open( 'GET', PATH_API_LOGIN + '?email=' + email.value.trim() + '&password=' + password.value.trim(), true );
  xhr.send( null );
}

function doLoginLoad()
{
  if( xhr.responseText == ERROR_ACCOUNT_MISSING )
  {
    clean( doLoginLoad );
    alert( MESSAGE_ACCOUNT_MISSING );  
    return;
  }
  
  if( xhr.responseText == ERROR_PASSWORD_INCORRECT )
  {
    clean( doLoginLoad );
    alert( MESSAGE_PASSWORD_INCORRECT );
    return;
  }
  
  if( xhr.responseText == ERROR_VERIFY_REQUIRED )
  {
    clean( doLoginLoad );
    alert( MESSAGE_VERIFY_REQUIRED );
    return;
  }  
  
  if( xhr.responseText == SUCCESS )
  {
    location.href = PATH_ACCOUNT; 
  }
}
           
function doSignUpClick()
{
  var company = null;
  var confirm = null;
  var customer = null;
  var email = null;
  var password = null;
  
  // Email
  email = document.querySelector( '.sign-up .email' );
  
  // Required
  if( email.value.trim().length === 0 )
  {
    alert( MESSAGE_EMAIL_REQUIRED );
    email.focus();
    return;
  }
  
  // Format
  if( email.value.indexOf( '.' ) === -1 || email.value.indexOf( '@' ) === -1 )
  {
    alert( MESSAGE_EMAIL_FORMAT );
    email.focus();
    return;
  }
  
  // Password
  password = document.querySelector( '.sign-up .password' );
  
  // Required
  if( password.value.trim().length === 0 )
  {
    alert( MESSAGE_PASSWORD_REQUIRED );  
    password.focus();
    return;
  }
  
  // Confirm
  confirm = document.querySelector( '.confirm' );
  
  // Required
  if( confirm.value.trim().length === 0 )
  {
    alert( MESSAGE_CONFIRM_REQUIRED );
    confirm.focus();
    return;
  }
  
  // Match
  if( confirm.value.trim() != password.value.trim() )
  {
    alert( MESSAGE_PASSWORD_MATCH );
    confirm.focus();
    return;
  }
 
  // Gather remaining fields
  customer = document.querySelector( '.customer' );
  company = document.querySelector( '.company' );
  
  xhr = new XMLHttpRequest();
  xhr.addEventListener( 'load', doSignUpLoad );
  xhr.open( 'POST', PATH_API_ACCOUNT );
  xhr.setRequestHeader( 'Content-Type', 'application/json;charset=UTF-8' );  
  xhr.send( JSON.stringify( {
    name: customer.value.trim(),
    company: company.value.trim(),
    email: email.value.trim(),
    password: password.value.trim(),
    verification: generateUUID()
  } ) );
}

function doSignUpLoad()
{
  if( xhr.responseText == ERROR_ACCOUNT_EXISTS )
  {
    clean( doSignUpLoad );
    alert( MESSAGE_ACCOUNT_EXISTS );
    return;    
  }
  
  if( xhr.responseText == SUCCESS )
  {
    clean( doSignUpLoad );
    alert( MESSAGE_EMAIL_CHECK );
  }  
}

function doWindowLoad()
{
  var banner = null;
  var button = null;
  var splash = null;
  var verify = null;
  
  // TODO: Using index page in place of verify
  /*
  verify = Cookies.get( COOKIE_VERIFY );
  
  if( verify != undefined )
  {
      if( verify == ERROR_VERIFY_ALREADY )
      {
        alert( MESSAGE_VERIFY_ALREADY );  
      } else if( verify == ERROR_VERIFY_MISSING ) {
        alert( MESSAGE_ACCOUNT_MISSING ); 
      } else if( verify == SUCCESS ) {
        Cookies.expire( COOKIE_VERIFY );
        alert( MESSAGE_VERIFY_COMPLETE );
      }
  }
  */

  // Splash screen sizing
  splash = document.querySelector( '.splash' );
  
  if( window.innerWidth > window.innerHeight )
  {
    banner = document.querySelector( '.banner' );    
    
    if( ( splash.clientHeight + banner.clientHeight )  < window.innerHeight )
    {       
      splash.style.height = ( window.innerHeight - banner.clientHeight ) + 'px';  
    }
  }
  
  // Login button event listener
  button = document.querySelector( '.login button' );
  button.addEventListener( 'click', doLoginClick );
  
  // Sing up button event listener
  button = document.querySelector( '.sign-up button' );
  button.addEventListener( 'click', doSignUpClick );  
}
  
window.addEventListener( "load", doWindowLoad );
