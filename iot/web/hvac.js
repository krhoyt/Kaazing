// Kaazing client ID
var IOT_TOPIC = 'iot_topic';
var KAAZING_ID = 'd71dfe3a-818e-4f9c-8af6-fb81649d9a6d';
var PARSE_APP = '_PARSE_APP_';
var PARSE_KEY = '_PARSE_JS_KEY_';
var REAL_TIME_ON = 1;
var REAL_TIME_OFF = 0;
var SVG_PATH = 'http://www.w3.org/2000/svg';

var Iot = Parse.Object.extend( 'Iot' );

var comfort = null;
var comfort_history = null;
var interval = null;
var kaazing = null;
var realtime = false;

function drawComfort( value ) 
{
  var path = null;
  var wave = null;
  
  // Remove existing
  while( comfort.children.length > 0 )
  {
    comfort.removeChild( comfort.children[0] ); 
  }

  // Outer range
  path = document.createElementNS( SVG_PATH, 'path' );
  path.setAttribute( 'd', 
    'M0 140 ' + 
    'L' + comfort.clientWidth + ' 30 ' + 
    'L' + comfort.clientWidth + ' 100 ' + 
    'L30 200 ' +
    'L0 200 Z'
  );
  path.setAttribute( 'stroke', '#ffd33f' );
  path.setAttribute( 'stroke-width', '5' );  
  path.setAttribute( 'fill', 'rgba( 255, 211, 63, 0.50 )' );
  comfort.appendChild( path );
  
  // Inner range
  path = document.createElementNS( SVG_PATH, 'path' );
  path.setAttribute( 'd', 
    'M0 150 ' + 
    'L' + comfort.clientWidth + ' 40 ' + 
    'L' + comfort.clientWidth + ' 90 ' + 
    'L0 200 Z'                     
  );
  path.setAttribute( 'fill', '#70c047' );
  comfort.appendChild( path );
  
  if( value != null )
  {
    var offset = ( ( comfort.clientWidth - 20 ) * Math.random() );
    
    // Inner value
    path = document.createElementNS( SVG_PATH, 'circle' );
    path.setAttribute( 'cx', offset );
    path.setAttribute( 'cy', 100 + ( 90 * value ) );
    path.setAttribute( 'r', 6 );
    path.setAttribute( 'fill', 'black' );
    comfort.appendChild( path );

    // Ring around value
    path = document.createElementNS( SVG_PATH, 'circle' );
    path.setAttribute( 'cx', offset );
    path.setAttribute( 'cy', 100 + ( 90 * value ) );
    path.setAttribute( 'r', 10 );
    path.setAttribute( 'stroke', 'black' );
    path.setAttribute( 'fill', 'rgba( 0, 0, 0, 0 )' );
    comfort.appendChild( path );  

    // Polling
    if( interval == null )
    {
      interval = setInterval( queryLatest, 5000 ); 
    }    
  } else if( value == null ) {
    path = document.createElementNS( SVG_PATH, 'path' );
    path.setAttribute( 'stroke', 'black' );
    path.setAttribute( 'stroke-width', 2 );
    path.setAttribute( 'fill', 'rgba( 0, 0, 0, 0 )' );
    
    for( var h = 0; h < comfort_history.length; h++ )
    {
      if( h == 0 )
      {
        wave = 'M0 ' + ( 100 + ( 90 * comfort_history[h].comfort ) ) + ' ';
      } else {
        wave = wave + 'L' + h + ' ' + ( 100 + ( 90 * comfort_history[h].comfort ) ) + ' ';  
      }
    }
    
    path.setAttribute( 'd', wave );
    comfort.appendChild( path );
  }  
}

function queryLatest()
{
  var query = null;
  
  query = new Parse.Query( Iot );
  query.descending( 'createdAt' );
  query.first( {
    success: doLatestSuccess,
    error: doLatestError
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
    
  data = JSON.parse( message );
  
  if( data.attention == 'client' ) 
  {
    parts = data.value.split( ',' );
    
    if( comfort_history.length >= comfort.clientWidth )
    {
      comfort_history.splice( 0, 1 );  
    }
    
    comfort_history.push( {
      comfort: parseFloat( parts[0] ),
      usage: parseFloat( parts[1] ),
      index: parseFloat( parts[2] )
    } );
    
    drawComfort( null );
  }
}

function doKaazingClick() 
{
  // Stop polling
  clearInterval( interval );
  
  // Setup history
  comfort_history = [];
  
  // Start real time
  kaazing.publish( IOT_TOPIC, JSON.stringify( {
    attention: 'server',
    value: REAL_TIME_ON
  } ) );
}

function doLatestError( error ) 
{
  console.log( 'Latest' );
  console.log( error );
}

function doLatestSuccess( result ) 
{
  drawComfort( result.get( 'comfort' ) );
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

  // Common elements
  comfort = document.querySelector( '#comfort' );
  
  // Polling
  queryLatest();
}

Parse.initialize( PARSE_APP, PARSE_KEY );

window.addEventListener( 'load', doWindowLoad );
