var account = null;
var xhr = null;

function accountParse()
{
  var delimiter = null;

  account = Cookies.get( COOKIE_ACCOUNT );
  
  delimiter = account.indexOf( '{' );
  account = account.substr( delimiter, account.length );

  account = JSON.parse( account );
}

function accountPopulate()
{
  var field = null;
  
  // Token
  field = document.querySelector( '.placeholder' );
  field.innerHTML = account.token;
  
  // Name
  field = document.querySelector( '.customer' );
  field.value = account.name;  
  
  // Company
  field = document.querySelector( '.company' );
  field.value = account.company;    
  
  // Email
  field = document.querySelector( '.email' );
  field.value = account.email;      
}

function doAccountClick()
{
  var company = null;
  var confirm = null;
  var customer = null;
  var email = null;
  var password = null;
  
  email = document.querySelector( '.email' );
  
  if( email.value.trim().length === 0 )
  {
    alert( MESSAGE_EMAIL_REQUIRED );
    email.focus();
    return;
  }
  
  if( email.value.indexOf( '@' ) == -1 || email.value.indexOf( '.' ) == -1 )
  {
    alert( MESSAGE_EMAIL_FORMAT );
    email.focus();
    return;
  }
  
  password = document.querySelector( '.password' );
  
  if( password.value.trim().length === 0 )
  {
    alert( MESSAGE_PASSWORD_REQUIRED );
    password.focus();
    return;
  }
  
  confirm = document.querySelector( '.confirm' );
  
  if( confirm.value.trim().length === 0 )
  {
    alert( MESSAGE_CONFIRM_REQUIRED );
    confirm.focus();
    return;
  }
  
  if( confirm.value.trim() != password.value.trim() )
  {
    alert( MESSAGE_PASSWORD_MATCH );
    confirm.focus();
    return;
  }
  
  customer = document.querySelector( '.customer' );
  company = document.querySelector( '.company' );
  
  xhr = new XMLHttpRequest();
  xhr.addEventListener( 'load', doAccountLoad );
  xhr.open( 'PUT', PATH_API_ACCOUNT );
  xhr.setRequestHeader( 'Content-Type', 'application/json;charset=UTF-8' );    
  xhr.send( JSON.stringify( {
    id: account.id,
    name: customer.value.trim(),
    company: company.value.trim(),
    password: password.value.trim()
  } ) );
}

function doAccountLoad()
{
  var company = null;
  var confirm = null;
  var customer = null;  
  var email = null;
  var holder = null;
  var password = null;
  
  if( xhr.responseText == ERROR_ACCOUNT_MISSING )
  {
    clean( doAccountLoad );
    alert( MESSAGE_ACCOUNT_MISSING );
    return;
  }
  
  company = document.querySelector( '.company' );
  customer = document.querySelector( '.customer' );
  email = document.querySelector( '.email' );
  
  account.name = customer.value.trim();
  account.company = company.value.trim();
  account.email = email.value.trim();
  
  Cookies.set( COOKIE_ACCOUNT, JSON.stringify( account ) );
  
  password = document.querySelector( '.password' );
  password.value = '';
  
  confirm = document.querySelector( '.confirm' );
  confirm.value = '';

  clean( doAccountLoad );
  alert( MESSAGE_ACCOUNT_COMPLETE );
}

function doHistoryLoad()
{
  var created = null;
  var data = null;
  var line = null;
  var usage = null;
  
  data = JSON.parse( xhr.responseText );
  
  usage = document.querySelector( '.usage' );
  
  for( var d = 0; d < data.length; d++ )
  {
    created = moment( data[d] );
    
    line = document.createElement( 'p' );
    line.classList.add( 'placeholder' );
    line.innerHTML = created.format( 'MMM, D YYYY @ h:mm:ss A' );
    
    usage.appendChild( line );
  }
  
  clean( doHistoryLoad );  
}

function doLogoutClick()
{
  xhr = new XMLHttpRequest();
  xhr.addEventListener( 'load', doLogoutLoad );
  xhr.open( 'GET', '/api/logout' );
  xhr.send( null );
}

function doLogoutLoad()
{
  if( xhr.responseText == 'OK' )
  {
    location.href = '/';
  }
}

function doTokenClick()
{
  var selection = null;
  
  selection = confirm( 'Are you sure you want to reset your token?' );
  
  if( selection )
  {
    // TODO: Reset token  
  }
}

function doWindowLoad()
{
  var banner = null;
  var button = null;
  var splash = null;

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
  
  // Reset token event listener
  button = document.querySelector( '.token button' );
  button.addEventListener( 'click', doTokenClick );
  
  // Account update event listener
  button = document.querySelector( '.account button' );
  button.addEventListener( 'click', doAccountClick );  
  
  // Logout event listener
  button = document.querySelector( '.banner button' );
  button.addEventListener( 'click', doLogoutClick );    
  
  // Parse cookie and load details  
  accountParse();
  accountPopulate();
  
  // Load history
  xhr = new XMLHttpRequest();
  xhr.addEventListener( 'load', doHistoryLoad );
  xhr.open( 'GET', PATH_API_USAGE + '/' + account.token );
  xhr.send( null );
}
  
window.addEventListener( "load", doWindowLoad );
