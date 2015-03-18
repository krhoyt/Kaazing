// Kaazing client ID
var IOT_TOPIC = 'iot_topic';
var KAAZING_ID = 'd71dfe3a-818e-4f9c-8af6-fb81649d9a6d';
// var PARSE_APP = '_PARSE_APP_';
// var PARSE_KEY = '_PARSE_JS_KEY_';
var REAL_TIME_ON = 1;
var REAL_TIME_OFF = 0;
var SVG_PATH = 'http://www.w3.org/2000/svg';

var Iot = Parse.Object.extend( 'Iot' );

var comfort = null;
var comfort_history = null;
var interval = null;
var kaazing = null;
var realtime = false;

function drawRange()
{
  var path = null;
  
  // Outer range
  path = document.createElementNS( SVG_PATH, 'path' );
  path.setAttribute( 'd', 
    'M0 140 ' + 
    'L' + comfort.container.clientWidth + ' 30 ' + 
    'L' + comfort.container.clientWidth + ' 100 ' + 
    'L30 200 ' +
    'L0 200 Z'
  );
  path.setAttribute( 'stroke', '#ffd33f' );
  path.setAttribute( 'stroke-width', '5' );  
  path.setAttribute( 'fill', 'rgba( 255, 211, 63, 0.50 )' );
  comfort.range.appendChild( path );
  
  // Inner range
  path = document.createElementNS( SVG_PATH, 'path' );
  path.setAttribute( 'd', 
    'M0 150 ' + 
    'L' + comfort.container.clientWidth + ' 40 ' + 
    'L' + comfort.container.clientWidth + ' 90 ' + 
    'L0 200 Z'                     
  );
  path.setAttribute( 'fill', '#70c047' );
  comfort.range.appendChild( path );  
}

function drawComfort( value ) 
{
  var offset = null;
  var wave = null;
    
  if( value != null )
  {
    // Random vertical placement
    offset = ( ( comfort.container.clientWidth - 20 ) * Math.random() ) + 10;

    // Place plot
    comfort.plot.setAttribute( 'transform', 'translate( ' + offset + ', ' + ( 100 + ( 90 * value ) ) + ' )' );
    comfort.plot.setAttribute( 'opacity', 1 );
  } else if( value == null ) {    
    comfort.plot.setAttribute( 'opacity', 0 );          
    
    for( var h = 0; h < comfort.history.length; h++ )
    {
      if( h == 0 )
      {
        wave = 'M0 ' + ( 100 + ( 90 * comfort.history[h].comfort ) ) + ' ';
      } else {
        wave = wave + 'L' + h + ' ' + ( 100 + ( 90 * comfort.history[h].comfort ) ) + ' ';  
      }
    }
    
    comfort.chart.setAttribute( 'd', wave );
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

function doFiveClick()
{ 
  if( interval != null )
  {
    clearInterval( interval );
    interval = null;
  }
  
  // Start real time
  kaazing.publish( IOT_TOPIC, JSON.stringify( {
    attention: 'server',
    value: REAL_TIME_OFF
  } ) );  
  
  queryLatest();
  
  comfort.plot.setAttribute( 'opacity', 1 );
  comfort.chart.setAttribute( 'd', 'M0 0' );    
  comfort.chart.setAttribute( 'opacity', 0 );
  
  interval = setInterval( queryLatest, 5000 );
}

function doGatewayConnect() {
  console.log( 'Client connected.' );
  
  kaazing.on( Gateway.EVENT_MESSAGE, doGatewayMessage );
  kaazing.subscribe( IOT_TOPIC );  
}

function doGatewayMessage( message ) {
  var data = null;
  var parts = null;
  
  comfort.asof.innerHTML = 'As of Today at ' + moment().format( 'h:mm:ss A' );
  
  data = JSON.parse( message );
  
  if( data.attention == 'client' ) 
  {
    parts = data.value.split( ',' );
    
    if( comfort.history.length >= comfort.container.clientWidth )
    {
      comfort.history.splice( 0, 1 );  
    }
    
    comfort.history.push( {
      comfort: parseFloat( parts[0] ),
      usage: parseFloat( parts[1] ),
      index: parseFloat( parts[2] )
    } );
    
    drawComfort( null );
  }
}

function doKaazingClick() 
{
  if( interval != null )
  {
    // Stop polling
    clearInterval( interval );    
    interval = null;
  }
    
  comfort.plot.setAttribute( 'opacity', 0 );  
  comfort.chart.setAttribute( 'opacity', 1 );  
  comfort.chart.setAttribute( 'd', 'M0 0' );    
  
  // Start real time
  kaazing.publish( IOT_TOPIC, JSON.stringify( {
    attention: 'server',
    value: REAL_TIME_ON
  } ) );
}

function doManualClick()
{
  if( interval != null )
  {
    clearInterval( interval );  
    interval = null;
  }
  
  comfort.asof.innerHTML = 'As of the Last 30 Days';    
  
  comfort.plot.setAttribute( 'opacity', 1 );
  comfort.chart.setAttribute( 'd', 'M0 0' );  
  comfort.chart.setAttribute( 'opacity', 0 );  
  
  // Turn off real time
  kaazing.publish( IOT_TOPIC, JSON.stringify( {
    attention: 'server',
    value: REAL_TIME_OFF
  } ) );  
}

function doLatestError( error ) 
{
  console.log( 'Latest' );
  console.log( error );
}

function doLatestSuccess( result ) 
{
  comfort.asof.innerHTML = 'As of Today at ' + moment().format( 'h:mm:ss A' );  
  
  drawComfort( result.get( 'comfort' ) );
}

function doOneClick()
{ 
  if( interval != null )
  {
    clearInterval( interval );
    interval = null;
  }
  
  comfort.plot.setAttribute( 'opacity', 1 );  
  comfort.chart.setAttribute( 'd', 'M0 0' );    
  comfort.chart.setAttribute( 'opacity', 0 );  
  
  queryLatest();
  
  // Turn off real time
  kaazing.publish( IOT_TOPIC, JSON.stringify( {
    attention: 'server',
    value: REAL_TIME_OFF
  } ) );  
  
  interval = setInterval( queryLatest, 1000 );  
}

function doWindowLoad()
{
  var button = null;
  var controls = null;
  
  // Show controls
  if( URLParser( window.location.href ).hasParam( "controls" ) )
  {
    console.log( 'Controls requested.' );
    
    controls = document.querySelector( '#controls' );
    controls.style.visibility = 'visible';
  }
  
  // Gateway
  kaazing = Gateway.connect( KAAZING_ID, doGatewayConnect );  
  
  // Modes
  button = document.querySelector( '.refresh' );
  button.addEventListener( 'click', doManualClick );
  
  button = document.querySelector( '.turtle' );
  button.addEventListener( 'click', doFiveClick );  
  
  button = document.querySelector( '.funnel' );
  button.addEventListener( 'click', doOneClick );
  
  button = document.querySelector( '.kaazing' );
  button.addEventListener( 'click', doKaazingClick );  

  comfort = {
    asof: document.querySelector( '.as-of' ),
    chart: document.querySelector( '#chart' ),
    container: document.querySelector( '#comfort' ),
    history: new Array(),
    plot: document.querySelector( '#plot' ),
    range: document.querySelector( '#range' )
  };
  
  // Populate range
  drawRange();
  
  // Polling
  queryLatest();
}

Parse.initialize( PARSE_APP, PARSE_KEY );

window.addEventListener( 'load', doWindowLoad );
