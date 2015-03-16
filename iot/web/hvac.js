// Kaazing client ID
var IOT_TOPIC = 'iot_topic';
var KAAZING_ID = 'd71dfe3a-818e-4f9c-8af6-fb81649d9a6d';

var REAL_TIME_ON = 1;
var REAL_TIME_OFF = 0;

var kaazing = null;

function doGatewayConnect() {
  console.log( 'Client connected.' );
  
  kaazing.on( Gateway.EVENT_MESSAGE, doGatewayMessage );
  kaazing.subscribe( IOT_TOPIC );  
}

function doGatewayMessage( message ) {
  var data = null;
  var parts = null;
  
  console.log( message );    
  
  message = JSON.parse( message );
  
  if( message.attention == 'client' ) 
  {
    parts = message.value.split( ',' );
  }
}

function doKaazingClick() 
{
  kaazing.publish( IOT_TOPIC, JSON.stringify( {
    attention: 'server',
    value: REAL_TIME_ON
  } ) );
}

function doTurtleClick()
{ 
  kaazing.publish( IOT_TOPIC, JSON.stringify( {
    attention: 'server',
    value: REAL_TIME_OFF
  } ) );
}

function doWindowLoad()
{
  var button = null;
  
  kaazing = Gateway.connect( KAAZING_ID, doGatewayConnect );  
  
  button = document.querySelector( '.turtle' );
  button.addEventListener( 'click', doTurtleClick );
  
  button = document.querySelector( '.kaazing' );
  button.addEventListener( 'click', doKaazingClick );  
}

window.addEventListener( 'load', doWindowLoad );
