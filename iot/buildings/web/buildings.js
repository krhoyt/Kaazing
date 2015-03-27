// Kaazing client ID
var IOT_TOPIC = 'buildings_topic';
var KAAZING_ID = 'd71dfe3a-818e-4f9c-8af6-fb81649d9a6d';
var PARSE_APP = '_PARSE_APP_';
var PARSE_KEY = '_PARSE_JS_KEY_';
var REAL_TIME_ON = 1;
var REAL_TIME_OFF = 0;
var SVG_PATH = 'http://www.w3.org/2000/svg';

var Iot = Parse.Object.extend( 'Iot' );

var comfort = null;
var interval = null;
var kaazing = null;
var live = null;
var realtime = false;
var usage = null;

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
  var result = null;
  var transform = null;
  var wave = null;
    
  if( value != null )
  {
    result = scale( 
      value,
      -1,
      1,
      12,
      88
    );    

    // Label
    // Slider
    comfort.usage.innerHTML = Math.round( result ) + '%';      
    comfort.label.textContent = Math.round( result ) + '%';
    comfort.slider.setAttribute( 'width', Math.round( result ) + '%' );
    
    // Callout
    transform = scale( 
      result,
      12,
      88,
      0,
      comfort.callout.parentElement.clientWidth - 50 - 30
    );
        
    comfort.callout.setAttribute( 'transform', 
      'translate( ' + 
      Math.floor( transform ) + 
      ', 10 )' 
    );
    
    // Random horizontal placement
    // Since there is no time axis
    offset = ( ( comfort.container.clientWidth - 20 ) * Math.random() ) + 10;

    // Plot
    comfort.plot.setAttribute( 'transform', 'translate( ' + offset + ', ' + ( 100 + ( 88 * value ) ) + ' )' );
    comfort.plot.setAttribute( 'opacity', 1 );
  } else if( value == null ) {    
    result = scale( 
      comfort.history[comfort.history.length - 1].comfort,
      -1,
      1,
      12,
      88
    );
    
    // Label
    // Slider
    comfort.usage.innerHTML = Math.round( result ) + '%';      
    comfort.label.textContent = Math.round( result ) + '%';
    comfort.slider.setAttribute( 'width', Math.round( result ) + '%' );
    
    // Callout
    transform = scale( 
      result,
      12,
      88,
      0,
      comfort.callout.parentElement.clientWidth - 50 - 30
    );
    
    comfort.callout.setAttribute( 'transform', 
      'translate( ' + 
      Math.floor( transform ) + 
      ', 10 )' 
    );
    
    // Hide plot
    comfort.plot.setAttribute( 'opacity', 0 );          
    
    // Draw sine curve
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

function drawIndex( value ) 
{
  var result = null;
  var transform = null;
    
  if( value != null )
  {
    result = scale( 
      value,
      -1,
      1,
      12,
      88
    );    

    // Label
    // Slider
    live.usage.innerHTML = parseFloat( value ).toFixed( 2 );      
    live.label.textContent = Math.round( result ) + '%';
    live.slider.setAttribute( 'width', Math.round( result ) + '%' );
    
    // Callout
    transform = scale( 
      result,
      12,
      88,
      0,
      live.callout.parentElement.clientWidth - 50 - 30
    );    

    live.callout.setAttribute( 'transform', 
      'translate( ' + 
      Math.floor( transform ) + 
      ', 0 )' 
    );
  } else if( value == null ) {    
    result = scale( 
      comfort.history[comfort.history.length - 1].index,
      -1,
      1,
      12,
      88
    );    
    
    // Label
    // Slider
    live.usage.innerHTML = parseFloat( comfort.history[comfort.history.length - 1].index ).toFixed( 2 );      
    live.label.textContent = Math.round( result ) + '%';
    live.slider.setAttribute( 'width', Math.round( result ) + '%' );
    
    // Callout
    transform = scale( 
      result,
      12,
      88,
      0,
      live.callout.parentElement.clientWidth - 50 - 30
    );

    live.callout.setAttribute( 'transform', 
      'translate( ' + 
      Math.floor( transform ) + 
      ', 0 )' 
    );
  }  
}

function drawUsage( value ) 
{
  var result = null;
  var transform = null;
    
  if( value != null )
  {
    result = scale( 
      value,
      -1,
      1,
      12,
      88
    );    

    // Label
    // Slider
    usage.usage.innerHTML = Math.round( result ) + '%';      
    usage.label.textContent = Math.round( result ) + '%';
    usage.slider.setAttribute( 'width', Math.round( result ) + '%' );
    
    // Callout
    transform = scale( 
      result,
      12,
      88,
      0,
      usage.callout.parentElement.clientWidth - 50 - 30
    );

    usage.callout.setAttribute( 'transform', 
      'translate( ' + 
      Math.floor( transform ) + 
      ', 0 )' 
    );
  } else if( value == null ) {    
    result = scale( 
      comfort.history[comfort.history.length - 1].usage,
      -1,
      1,
      12,
      88
    );        

    // Label
    // Slider
    usage.usage.innerHTML = Math.round( result ) + '%';      
    usage.label.textContent = Math.round( result ) + '%';
    usage.slider.setAttribute( 'width', Math.round( result ) + '%' );
    
    // Callout
    transform = scale( 
      result,
      12,
      88,
      0,
      usage.callout.parentElement.clientWidth - 50 - 30
    );

    usage.callout.setAttribute( 'transform', 
      'translate( ' + 
      Math.floor( transform ) + 
      ', 0 )' 
    );
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

function scale( value, old_top, old_bottom, new_top, new_bottom )
{
  return new_bottom + ( new_top - new_bottom ) * ( ( value - old_bottom ) / ( old_top - old_bottom ) ); 
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
    drawUsage( null );
    drawIndex( null );
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
  drawUsage( result.get( 'usage' ) );
  drawIndex( result.get( 'index' ) );  
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
    callout: document.querySelector( '#comfort-callout' ),
    chart: document.querySelector( '#chart' ),
    container: document.querySelector( '#comfort' ),
    history: new Array(),
    label: document.querySelector( '#comfort-label' ),
    plot: document.querySelector( '#plot' ),
    range: document.querySelector( '#range' ),
    slider: document.querySelector( '#comfort-slider' ),
    usage: document.querySelector( '#comfort-percent' )
  };

  live = {
    callout: document.querySelector( '#live-callout' ),
    label: document.querySelector( '#live-label' ),
    slider: document.querySelector( '#live-slider' ),
    usage: document.querySelector( '#live-usage' ),
  };  
  
  usage = {
    callout: document.querySelector( '#usage-callout' ),
    label: document.querySelector( '#usage-label' ),
    slider: document.querySelector( '#usage-slider' ),
    usage: document.querySelector( '#usage-usage' ),
  };
  
  // Populate range
  drawRange();
  
  // Polling
  queryLatest();
}

Parse.initialize( PARSE_APP, PARSE_KEY );

window.addEventListener( 'load', doWindowLoad );
