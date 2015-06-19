function doWindowLoad()
{
  var element = null;
  var verify = null;
  
  verify = Cookies.get( COOKIE_VERIFY );  
  
  element = document.createElement( 'p' );
  
  if( verify == ERROR_VERIFY_ALREADY )
  {
    element.innerHTML = MESSAGE_VERIFY_ALREADY;
  } else if( verify == ERROR_VERIFY_MISSING ) {
    element.innerHTML = MESSAGE_VERIFY_MISSING;  
  } else if( verify == SUCCESS ) {
    Cookies.expire( COOKIE_VERIFY );
    element.innerHTML = MESSAGE_VERIFY_COMPLETE;
    
    setTimeout( function() {
      location.href = '/';  
    }, FORWARD_DELAY );
  }
  
  document.body.appendChild( element );
}

window.addEventListener( 'load', doWindowLoad );
