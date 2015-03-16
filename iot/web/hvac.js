// Kaazing client ID
var IOT_TOPIC = 'iot_topic';
var KAAZING_ID = 'd71dfe3a-818e-4f9c-8af6-fb81649d9a6d';
var PARSE_APP = '_PARSE_APP_';
var PARSE_KEY = '_PARSE_JS_KEY_';
var REAL_TIME_ON = 1;
var REAL_TIME_OFF = 0;

var Iot = Parse.Object.extend( 'Iot' );

var interval = null;
var kaazing = null;

function queryLatest()
{
  var query = null;
  
  query = new Parse.Query( Iot );
  query.descending( 'createdAt' );
  query.first( {
    success: function( result ) {
      if( interval == null )
      {
        interval = setInterval( queryLatest, 5000 );
      }
      
      console.log( result );  
    },
    error: function( error ) {
      console.log( 'Latest' );
      cnosole.log( error );
    }
  } );
}

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

function doTodayError( error ) 
{
  console.log( 'Today' );
  console.log( error );
}

function doTodaySuccess( results )
{
  console.log( results );
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
  
  // Gateway
  kaazing = Gateway.connect( KAAZING_ID, doGatewayConnect );  
  
  // Modes
  button = document.querySelector( '.turtle' );
  button.addEventListener( 'click', doTurtleClick );
  
  button = document.querySelector( '.kaazing' );
  button.addEventListener( 'click', doKaazingClick );  

  // Polling
  queryLatest();
}

Parse.initialize( PARSE_APP, PARSE_KEY );

window.addEventListener( 'load', doWindowLoad );
