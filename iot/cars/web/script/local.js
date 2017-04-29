// Constants
var MAX_COOLANT = 300;
var MAX_RPM = 5000;
var MAX_SPEED = 100;
var PLAYBACK_LOG = 'playback.txt';
var RADIUS_VSS = 262;
var RADIUS_VSS_DASH = 275;
var RADIUS_RPM = 238;
var RADIUS_RPM_DASH = 225;
var SVG_PATH = 'http://www.w3.org/2000/svg';
var VIDEO_PATH = 'http://temp.kevinhoyt.com/kaazing/iot/cars/playback.mp4';
var VIDEO_TYPE = 'video/mp4';

// Engine
var ecu = {
  vss: 0.35,
  rpm: 0.60,
  temp: 0.50,
  fuel: 0.75
};

// Map
var map = {
  google: null,
  marker: null,
  path: [],
  root: null,
  route: null
};

// Dashboard
var svg = {
  element_fuel: null,
  element_rpm: null,
  element_temp: null,
  element_vss: null,
  radius_rpm: ( 2 * Math.PI * RADIUS_RPM ) * ( 180 / 360 ),
  radius_vss: ( 2 * Math.PI * RADIUS_VSS ) * ( 180 / 360 ),
  root: null
};

// Video
var video = {
  element: null,
  first: null,
  playing: null,
  popcorn: null,
  ready: null,
  start: 0
};
  
// Offline
var offline = {
  index: 0,
  interval: null,
  playback: null,
  rate: null,
  xhr: null
};

// Called to load playback data
// Averages out playback rate
function average()
{
  offline.xhr = new XMLHttpRequest();
  offline.xhr.addEventListener( 'load', doPlaybackLoad );
  offline.xhr.open( 'GET', PLAYBACK_LOG, true );
  offline.xhr.send( null );
}

// Called to draw dashboard
// Only called once
function draw()
{
  var indicators = null;
  
  // Parts
  vss();
  rpm();
  fuel();  
  temp();
  
  // General indicators
  indicators = document.querySelector( '.indicators' );
  indicators.style.left = ( ( window.innerWidth - indicators.clientWidth ) / 2 ) + 'px';
  indicators.style.visibility = 'visible';
}
  
// Draws fuel gauge
function fuel()
{
  var path = null;
  
  // Fuel status
  path = document.createElementNS( SVG_PATH, 'path' );
  path.setAttribute( 'stroke-width', 10 );
  path.setAttribute( 'stroke', 'rgb( 72, 72, 72 )' );
  path.setAttribute( 'fill', 'rgba( 72, 72, 72, 0 )' );
  path.setAttribute( 'd', 
    'M ' + ( ( window.innerWidth / 2 ) - ( window.innerWidth / 3 ) ) + ', 225 ' +
    'A 100, 100 0 0, 0 ' + ( ( ( window.innerWidth / 2 ) - ( window.innerWidth / 3 ) ) - 100 ) + ', 325' 
  );
  svg.root.appendChild( path );     
  
  // Fuel measure
  path = document.createElementNS( SVG_PATH, 'path' );
  path.setAttribute( 'stroke-width', 6 );
  path.setAttribute( 'stroke', 'white' );
  path.setAttribute( 'fill', 'rgba( 255, 255, 255, 0 )' );
  path.setAttribute( 'd', 
    'M ' + ( ( window.innerWidth / 2 ) - ( window.innerWidth / 3 ) ) + ', 212 ' + 
    'A 113, 113 0 0, 0 ' + ( ( ( window.innerWidth / 2 ) - ( window.innerWidth / 3 ) - 113 ) ) + ', 325' 
  );
  svg.root.appendChild( path );     
  
  // Fuel tick marks
  for( var d = 0; d < 3; d++ )
  {
    path = document.createElementNS( SVG_PATH, 'rect' );
    path.setAttribute( 'x', ( window.innerWidth / 2 ) - ( window.innerWidth / 3 ) + 110 );
    path.setAttribute( 'y', 321 );
    path.setAttribute( 'width', 15 );
    path.setAttribute( 'height', 2 );
    path.setAttribute( 'fill', 'white' );                
    path.setAttribute( 'stroke', 'rgba( 255, 255, 255, 0 )' );
    path.setAttribute( 'transform', 'rotate( ' + ( 270 + ( -45 * d ) ) + ', ' + ( ( window.innerWidth / 2 ) - ( window.innerWidth / 3 ) ) + ', 323 )' );
    svg.root.appendChild( path );    
  }        
  
  // Fuel dash marks
  for( var d = 0; d < 2; d++ )
  {
    path = document.createElementNS( SVG_PATH, 'rect' );
    path.setAttribute( 'x', ( window.innerWidth / 2 ) - ( window.innerWidth / 3 ) + 108 );
    path.setAttribute( 'y', 323 );
    path.setAttribute( 'width', 8 );
    path.setAttribute( 'height', 2 );    
    path.setAttribute( 'fill', 'black' );            
    path.setAttribute( 'stroke', 'rgba( 255, 255, 255, 0 )' );
    path.setAttribute( 'transform', 'rotate( ' + ( 270 + ( -45 * d ) - 22.5 ) + ', ' + ( ( window.innerWidth / 2 ) - ( window.innerWidth / 3 ) ) + ', 323 )' );
    svg.root.appendChild( path );    
  }        
  
  // Fuel values
  for( var d = 0; d < 3; d++ ) 
  {
    opposite = Math.sin( ( d * 45 ) * ( Math.PI / 180 ) ) * 130;                                                                                                                                                                                                                                                                                                                                                          ( ( d * 36.08 ) * ( Math.PI / 180 ) ) * 202;
    adjacent = Math.cos( ( d * 45 ) * ( Math.PI / 180 ) ) * 130;

    path = document.createElementNS( SVG_PATH, 'text' );
    path.setAttribute( 'text-anchor', 'end' );           
    path.setAttribute( 'fill', 'white' );
    path.setAttribute( 'x', ( window.innerWidth / 2 ) - ( window.innerWidth / 3 ) - adjacent );
    
    if( d == 0 ) {
      path.setAttribute( 'y', 325 + 4 - opposite );   
      path.textContent = 'E';
    } else if( d == 2 ) {
      path.setAttribute( 'y', 325 - 4 - opposite );                       
      path.setAttribute( 'text-anchor', 'middle' ); 
      path.textContent = 'F';      
    } else {
      path.setAttribute( 'y', 325 - opposite );                      
      path.textContent = '1/2';
    }

    path.setAttribute( 'font-size', 18 );
    svg.root.appendChild( path );          
  }      
  
  // Fuel icon
  path = document.querySelector( '.fuel' );
  path.style.left = ( ( window.innerWidth / 2 ) - ( window.innerWidth / 3 ) - 50 ) + 'px';                              
  path.style.visibility = 'visible';  
}

// Revolutions per minute
function rpm()
{
  var adjacent = null;
  var opposite = null;
  var path = null;
  
  // RPM gauge
  path = document.createElementNS( SVG_PATH, 'path' );
  path.setAttribute( 'stroke-width', 10 );
  path.setAttribute( 'stroke', 'rgb( 72, 72, 72 )' );
  path.setAttribute( 'fill', 'rgba( 72, 72, 72, 0 )' );  
  path.setAttribute( 'd', 
    'M ' + ( ( window.innerWidth / 2 ) - RADIUS_RPM ) + ', 325 ' + 
    'A 238, 238 0 0, 1 ' + ( ( ( window.innerWidth / 2 ) - RADIUS_RPM ) + ( 2 * RADIUS_RPM ) ) + ', 325' 
  );
  svg.root.appendChild( path );  
  
  // RPM measure
  path = document.createElementNS( SVG_PATH, 'path' );
  path.setAttribute( 'stroke-width', 6 );
  path.setAttribute( 'stroke', 'white' );
  path.setAttribute( 'fill', 'rgba( 255, 255, 255, 0 )' );  
  path.setAttribute( 'd', 
    'M ' + ( ( window.innerWidth / 2 ) - RADIUS_RPM_DASH ) + ', 325 ' + 
    'A 225, 225 0 0, 1 ' + ( ( ( window.innerWidth / 2 ) - RADIUS_RPM_DASH ) + ( 2 * RADIUS_RPM_DASH ) ) + ', 325' 
  );
  svg.root.appendChild( path );    
  
  // RPM red zone
  path = document.createElementNS( SVG_PATH, 'path' );
  path.setAttribute( 'stroke-width', 6 );
  path.setAttribute( 'fill', 'rgba( 255, 0, 0, 0 )' );
  path.setAttribute( 'stroke', 'red' );
  path.setAttribute( 'stroke-dashoffset', svg.radius_rpm + ( svg.radius_rpm * 0.247 ) );  
  path.setAttribute( 'stroke-dasharray', svg.radius_rpm );        
  path.setAttribute( 'd', 
    'M ' + ( ( window.innerWidth / 2 ) - RADIUS_RPM_DASH ) + ', 325 ' + 
    'A 225, 225 0 0, 1 ' + ( ( ( window.innerWidth / 2 ) - RADIUS_RPM_DASH ) + ( 2 * RADIUS_RPM_DASH ) ) + ', 325' 
  );
  svg.root.appendChild( path );   
  
  // RPM tick marks
  for( var d = 0; d < 6; d++ )
  {
    path = document.createElementNS( SVG_PATH, 'rect' );
    path.setAttribute( 'x', ( window.innerWidth / 2 ) - RADIUS_RPM_DASH );
    path.setAttribute( 'y', 323 );
    path.setAttribute( 'width', 15 );
    path.setAttribute( 'height', 2 );
    
    if( d > 3 )
    {
      path.setAttribute( 'fill', 'red' );      
    } else {
      path.setAttribute( 'fill', 'white' );      
    }

    path.setAttribute( 'stroke', 'rgba( 255, 255, 255, 0 )' );
    path.setAttribute( 'transform', 'rotate( ' + ( 36.10 * d ) + ', ' + ( window.innerWidth / 2 ) + ', 323 )' );
    svg.root.appendChild( path );    
  }    
  
  // RPM dashes
  for( var d = 0; d < 24; d++ )
  {
    path = document.createElementNS( SVG_PATH, 'rect' );
    path.setAttribute( 'x', ( window.innerWidth / 2 ) - RADIUS_RPM_DASH - 3 );
    path.setAttribute( 'y', 323 );
    path.setAttribute( 'width', 7 );
    path.setAttribute( 'height', 2 );
    
    if( ( ( d + 1 ) % 5 ) == 0 ) 
    {
      path.setAttribute( 'fill', 'rgba( 255, 255, 255, 0 )' );      
    } else {
      path.setAttribute( 'fill', 'black' );      
    }
  
    path.setAttribute( 'stroke', 'rgba( 255, 255, 255, 0 )' );
    path.setAttribute( 'transform', 'rotate( ' + ( ( 7.22 * d ) + 7.22 ) + ', ' + ( window.innerWidth / 2 ) + ', 325 )' );
    svg.root.appendChild( path );    
  }         
  
  // RPM indicators  
  for( var d = 0; d < 6; d++ ) 
  {
    opposite = Math.sin( ( d * 36.08 ) * ( Math.PI / 180 ) ) * 202;
    adjacent = Math.cos( ( d * 36.08 ) * ( Math.PI / 180 ) ) * 202;

    path = document.createElementNS( SVG_PATH, 'text' );
    path.textContent = d;
    path.setAttribute( 'fill', 'white' );
    path.setAttribute( 'x', ( window.innerWidth / 2 ) - adjacent );
    path.setAttribute( 'font-size', 22 );
    
    if( d == 2 || d == 3 ) {
      path.setAttribute( 'y', 325 + 10 - opposite );            
    } else {
      path.setAttribute( 'y', 325 + 5 - opposite );            
    }
    
    if( d < 3 )
    {
      path.setAttribute( 'text-anchor', 'start' );      
    } else if( d > 2 ) {
      path.setAttribute( 'text-anchor', 'end' );            
    }

    svg.root.appendChild( path );          
  }  
  
  // Units
  opposite = Math.sin( 90 * ( Math.PI / 180 ) ) * 160;
  adjacent = Math.cos( 90 * ( Math.PI / 180 ) ) * 160;

  path = document.createElementNS( SVG_PATH, 'text' );
  path.textContent = 'x1000/min';
  path.setAttribute( 'fill', 'white' );
  path.setAttribute( 'x', ( window.innerWidth / 2 ) - adjacent );
  path.setAttribute( 'y', 325 - opposite );        
  path.setAttribute( 'font-size', 14 );
  path.setAttribute( 'text-anchor', 'middle' );      
  svg.root.appendChild( path );          
}

// Temperature
function temp() 
{
  var adjacent = null;
  var opposite = null;
  var path = null;
  
  // Temperature gauge
  path = document.createElementNS( SVG_PATH, 'path' );
  path.setAttribute( 'stroke-width', 10 );
  path.setAttribute( 'stroke', 'rgb( 72, 72, 72 )' );
  path.setAttribute( 'fill', 'rgba( 72, 72, 72, 0 )' );
  path.setAttribute( 'd', 
    'M ' + ( ( window.innerWidth / 2 ) + ( window.innerWidth / 3 ) ) + ', 225 ' +
    'A 100, 100 0 0, 1 ' + ( ( ( window.innerWidth / 2 ) + ( window.innerWidth / 3 ) + 100 ) ) + ', 325' 
  );
  svg.root.appendChild( path );   
  
  // Temperature measure
  path = document.createElementNS( SVG_PATH, 'path' );
  path.setAttribute( 'stroke-width', 6 );
  path.setAttribute( 'stroke', 'white' );
  path.setAttribute( 'fill', 'rgba( 255, 255, 255, 0 )' );
  path.setAttribute( 'd', 
    'M ' + ( ( window.innerWidth / 2 ) + ( window.innerWidth / 3 ) ) + ', 212 ' + 
    'A 113, 113 0 0, 1 ' + ( ( ( window.innerWidth / 2 ) + ( window.innerWidth / 3 ) + 113 ) ) + ', 325' 
  );
  svg.root.appendChild( path );   
  
  // Temperature red zone
  path = document.createElementNS( SVG_PATH, 'path' );
  path.setAttribute( 'stroke-width', 6 );
  path.setAttribute( 'fill', 'rgba( 255, 0, 0, 0 )' );
  path.setAttribute( 'stroke', 'red' );
  path.setAttribute( 'fill', 'rgba( 255, 0, 0, 0 )' );
  path.setAttribute( 'stroke-dashoffset', 314 );  
  path.setAttribute( 'stroke-dasharray', 314 + ( 314 * 0.14 ) );        
  path.setAttribute( 'd', 
    'M ' + ( ( window.innerWidth / 2 ) + ( window.innerWidth / 3 ) ) + ', 212 ' + 
    'A 113, 113 0 0, 1 ' + ( ( ( window.innerWidth / 2 ) + ( window.innerWidth / 3 ) + 113 ) ) + ', 325' 
  );
  svg.root.appendChild( path );     
  
  // Temperature tick marks
  for( var d = 0; d < 3; d++ )
  {
    path = document.createElementNS( SVG_PATH, 'rect' );
    path.setAttribute( 'x', ( window.innerWidth / 2 ) + ( window.innerWidth / 3 ) + 110 );
    path.setAttribute( 'y', 323 );
    path.setAttribute( 'width', 15 );
    path.setAttribute( 'height', 2 );
    
    if( d == 2 )
    {
      path.setAttribute( 'fill', 'red' );            
    } else {
      path.setAttribute( 'fill', 'white' );            
    }

    path.setAttribute( 'stroke', 'rgba( 255, 255, 255, 0 )' );
    path.setAttribute( 'transform', 'rotate( ' + ( -45 * d ) + ', ' + ( ( window.innerWidth / 2 ) + ( window.innerWidth / 3 ) ) + ', 323 )' );
    svg.root.appendChild( path );    
  }      
  
  // Temperature dash marks
  for( var d = 0; d < 2; d++ )
  {
    path = document.createElementNS( SVG_PATH, 'rect' );
    path.setAttribute( 'x', ( window.innerWidth / 2 ) + ( window.innerWidth / 3 ) + 108 );
    path.setAttribute( 'y', 323 );
    path.setAttribute( 'width', 8 );
    path.setAttribute( 'height', 2 );    
    path.setAttribute( 'fill', 'black' );            
    path.setAttribute( 'stroke', 'rgba( 255, 255, 255, 0 )' );
    path.setAttribute( 'transform', 'rotate( ' + ( ( -45 * d ) - 22.5 ) + ', ' + ( ( window.innerWidth / 2 ) + ( window.innerWidth / 3 ) ) + ', 323 )' );
    svg.root.appendChild( path );    
  }        
  
  // Temperature values
  for( var d = 0; d < 3; d++ ) 
  {
    opposite = Math.sin( ( d * 45 ) * ( Math.PI / 180 ) ) * 130;                                                                                                                                                                                                                                                                                                                                                          ( ( d * 36.08 ) * ( Math.PI / 180 ) ) * 202;
    adjacent = Math.cos( ( d * 45 ) * ( Math.PI / 180 ) ) * 130;

    path = document.createElementNS( SVG_PATH, 'text' );
    
    if( d == 2 )
    {
      path.textContent = ( d * 180 ) + '\u00B0F';      
    } else {
      path.textContent = d * 180;      
    }
    
    path.setAttribute( 'fill', 'white' );
    path.setAttribute( 'x', ( window.innerWidth / 2 ) + ( window.innerWidth / 3 ) + adjacent );
    
    if( d == 0 ) {
      path.setAttribute( 'y', 325 + 4 - opposite );                      
    } else if( d == 2 ) {
      path.setAttribute( 'y', 325 - 4 - opposite );                            
    } else {
      path.setAttribute( 'y', 325 - opposite );                      
    }

    if( d == 2 ) {
      path.setAttribute( 'text-anchor', 'middle' ); 
    }
    
    path.setAttribute( 'font-size', 18 );
    svg.root.appendChild( path );          
  }    
  
  // Icon
  path = document.querySelector( '.temperature' );
  path.style.left = ( ( window.innerWidth / 2 ) + ( window.innerWidth / 3 ) + 25 ) + 'px';                              
  path.style.visibility = 'visible';
}
  
// Called to update dashboard
// Updates drawing of gauges
// Creates initial elements if needed
function update() 
{
  // RPM
  if( svg.element_rpm == null )
  {
    svg.element_rpm = document.createElementNS( SVG_PATH, 'path' );
    svg.element_rpm.setAttribute( 'stroke-width', 10 );
    svg.element_rpm.setAttribute( 'stroke', 'rgb( 81, 141, 163 )' );    
    svg.element_rpm.setAttribute( 'fill', 'rgba( 81, 141, 163, 0 )' );  
    svg.element_rpm.setAttribute( 'filter', 'url( #glow )' );    
    svg.element_rpm.setAttribute( 'stroke-dashoffset', svg.radius_rpm );  
    svg.element_rpm.setAttribute( 'stroke-dasharray', svg.radius_rpm + ( svg.radius_rpm * ecu.rpm ) );        
    svg.element_rpm.setAttribute( 'd', 
      'M ' + ( ( window.innerWidth / 2 ) - RADIUS_RPM ) + ', 325 ' + 
      'A 238, 238 0 0, 1 ' + ( ( ( window.innerWidth / 2 ) - RADIUS_RPM ) + ( 2 * RADIUS_RPM ) ) + ', 325' 
    );
    svg.root.appendChild( svg.element_rpm );         
  } else {
    svg.element_rpm.setAttribute( 'stroke-dasharray', svg.radius_rpm + ( svg.radius_rpm * ecu.rpm ) );    
  }
  
  // VSS
  if( svg.element_vss == null )
  {
    svg.element_vss = document.createElementNS( SVG_PATH, 'path' );
    svg.element_vss.setAttribute( 'stroke-width', 10 );
    svg.element_vss.setAttribute( 'stroke', 'rgb( 98, 189, 106 )' );
    svg.element_vss.setAttribute( 'fill', 'rgba( 98, 189, 106, 0 )' );  
    svg.element_vss.setAttribute( 'filter', 'url( #glow )' );        
    svg.element_vss.setAttribute( 'stroke-dashoffset', svg.radius_vss );  
    svg.element_vss.setAttribute( 'stroke-dasharray', svg.radius_vss + ( svg.radius_vss * ecu.vss ) );        
    svg.element_vss.setAttribute( 'd', 
      'M ' + ( ( window.innerWidth / 2 ) - RADIUS_VSS ) + ', 325 ' + 
      'A 262, 262 0 0, 1 ' + ( ( ( window.innerWidth / 2 ) - RADIUS_VSS ) + ( 2 * RADIUS_VSS ) ) + ', 325' 
    );
    svg.root.appendChild( svg.element_vss );         
  } else {
    svg.element_vss.setAttribute( 'stroke-dasharray', svg.radius_vss + ( svg.radius_vss * ecu.vss ) );    
  }  
  
  // Temperature
  if( svg.element_temp == null )
  {
    svg.element_temp = document.createElementNS( SVG_PATH, 'path' );
    svg.element_temp.setAttribute( 'stroke-width', 10 );
    svg.element_temp.setAttribute( 'stroke', 'rgb( 81, 141, 163 )' );
    svg.element_temp.setAttribute( 'fill', 'rgba( 81, 141, 163, 0 )' );
    svg.element_temp.setAttribute( 'filter', 'url( #glow )' );            
    svg.element_temp.setAttribute( 'stroke-dashoffset', 157 + ( 157 * ecu.temp ) );  
    svg.element_temp.setAttribute( 'stroke-dasharray', 157 );            
    svg.element_temp.setAttribute( 'd', 
      'M ' + ( ( window.innerWidth / 2 ) + ( window.innerWidth / 3 ) ) + ', 225 ' +
      'A 100, 100 0 0, 1 ' + ( ( ( window.innerWidth / 2 ) + ( window.innerWidth / 3 ) + 100 ) ) + ', 325' 
    );
    svg.root.appendChild( svg.element_temp );   
  } else {
    svg.element_temp.setAttribute( 'stroke-dashoffset', 157 + ( 157 * ecu.temp ) );        
  }
  
  // Fuel
  // Fuel is static value
  // Could be dynamic
  if( svg.element_fuel == null )
  {
    svg.element_fuel = document.createElementNS( SVG_PATH, 'path' );
    svg.element_fuel.setAttribute( 'stroke-width', 10 );
    svg.element_fuel.setAttribute( 'stroke', 'rgb( 81, 141, 163 )' );
    svg.element_fuel.setAttribute( 'fill', 'rgba( 81, 141, 163, 0 )' );
    svg.element_fuel.setAttribute( 'filter', 'url( #glow )' );            
    svg.element_fuel.setAttribute( 'stroke-dashoffset', 157 + ( 157 * ecu.fuel ) );  
    svg.element_fuel.setAttribute( 'stroke-dasharray', 157 );            
    svg.element_fuel.setAttribute( 'd', 
      'M ' + ( ( window.innerWidth / 2 ) - ( window.innerWidth / 3 ) ) + ', 225 ' +
      'A 100, 100 0 0, 0 ' + ( ( ( window.innerWidth / 2 ) - ( window.innerWidth / 3 ) - 100 ) ) + ', 325' 
    );
    svg.root.appendChild( svg.element_fuel );   
  }  
}
  
// Speed
function vss() 
{
  var adjacent = null;
  var opposite = null;
  var path = null;
  
  // VSS gauge
  path = document.createElementNS( SVG_PATH, 'path' );
  path.setAttribute( 'stroke-width', 10 );
  path.setAttribute( 'stroke', 'rgb( 72, 72, 72 )' );
  path.setAttribute( 'fill', 'rgba( 72, 72, 72, 0 )' );  
  path.setAttribute( 'd', 
    'M ' + ( ( window.innerWidth / 2 ) - RADIUS_VSS ) + ', 325 ' + 
    'A 262, 262 0 0, 1 ' + ( ( ( window.innerWidth / 2 ) - RADIUS_VSS ) + ( 2 * RADIUS_VSS ) ) + ', 325' 
  );
  svg.root.appendChild( path );

  // VSS measure
  path = document.createElementNS( SVG_PATH, 'path' );
  path.setAttribute( 'stroke-width', 6 );
  path.setAttribute( 'fill', 'rgba( 255, 255, 255, 0 )' );
  path.setAttribute( 'stroke', 'white' );
  path.setAttribute( 'd', 
    'M ' + ( ( window.innerWidth / 2 ) - RADIUS_VSS_DASH ) + ', 325 ' + 
    'A 275, 275 0 0, 1 ' + ( ( ( window.innerWidth / 2 ) - RADIUS_VSS_DASH ) + ( 2 * RADIUS_VSS_DASH ) ) + ', 325' 
  );
  svg.root.appendChild( path );  
    
  // VSS tick marks
  for( var d = 0; d < 11; d++ )
  {
    path = document.createElementNS( SVG_PATH, 'rect' );
    path.setAttribute( 'x', ( window.innerWidth / 2 ) - RADIUS_VSS_DASH - 12 );
    path.setAttribute( 'y', 323 );
    path.setAttribute( 'width', 15 );
    path.setAttribute( 'height', 2 );
    path.setAttribute( 'fill', 'white' );
    path.setAttribute( 'stroke', 'rgba( 255, 255, 255, 0 )' );
    path.setAttribute( 'transform', 'rotate( ' + ( 18.04 * d ) + ', ' + ( window.innerWidth / 2 ) + ', 323 )' );
    svg.root.appendChild( path );    
  }
  
  // VSS dashes
  for( var d = 0; d < 11; d++ )
  {
    path = document.createElementNS( SVG_PATH, 'rect' );
    path.setAttribute( 'x', ( window.innerWidth / 2 ) - RADIUS_VSS_DASH - 4 );
    path.setAttribute( 'y', 325 );
    path.setAttribute( 'width', 7 );
    path.setAttribute( 'height', 2 );
    path.setAttribute( 'fill', 'black' );
    path.setAttribute( 'stroke', 'rgba( 255, 255, 255, 0 )' );
    path.setAttribute( 'transform', 'rotate( ' + ( ( 18.04 * d ) + 9.02 ) + ', ' + ( window.innerWidth / 2 ) + ', 325 )' );
    svg.root.appendChild( path );    
  }        
  
  // Speed indicators  
  for( var d = 0; d < 11; d++ ) 
  {
    opposite = Math.sin( ( d * 18.04 ) * ( Math.PI / 180 ) ) * 295;
    adjacent = Math.cos( ( d * 18.04 ) * ( Math.PI / 180 ) ) * 295;

    path = document.createElementNS( SVG_PATH, 'text' );
    path.textContent = d * 10;
    path.setAttribute( 'fill', 'white' );
    path.setAttribute( 'x', ( window.innerWidth / 2 ) - adjacent );
    path.setAttribute( 'font-size', 22 );
    
    if( d == 0 || d == 10 ) {
      path.setAttribute( 'y', 325 + 5 - opposite );      
    } else {
      path.setAttribute( 'y', 325 - opposite );      
    }
    
    if( d < 5 )
    {
      path.setAttribute( 'text-anchor', 'end' );      
    } else if( d == 5) {
      path.setAttribute( 'text-anchor', 'middle' );            
    } else if( d > 5 ) {
      path.setAttribute( 'text-anchor', 'start' );            
    }

    svg.root.appendChild( path );          
  }
  
  // Units
  opposite = Math.sin( 9.02 * ( Math.PI / 180 ) ) * 295;
  adjacent = Math.cos( 9.02 * ( Math.PI / 180 ) ) * 295;

  path = document.createElementNS( SVG_PATH, 'text' );
  path.textContent = 'mph';
  path.setAttribute( 'fill', 'white' );
  path.setAttribute( 'x', ( window.innerWidth / 2 ) - adjacent );
  path.setAttribute( 'y', 325 + 3 - opposite );        
  path.setAttribute( 'font-size', 14 );
  path.setAttribute( 'text-anchor', 'end' );      
  svg.root.appendChild( path );        
}  
  
// Called when a message has arrived
// Gets JSON value
// Calls to upate gauge values
// May start video playback
function doGatewayMessage() {
  var data = null;
  var waiting = null;

  // Parse data
  data = offline.playback[offline.index];
  offline.index = offline.index + 1;

  // Start video on first message
  // Only if video is requested
  if( video.popcorn != null )
  {
    // Not already playing
    // Start playing video
    if( !video.playing ) 
    {
      // Video
      video.first = data.time;
      video.playing = true;
      video.popcorn.play( video.start );        
      
      // Remove block
      waiting = document.querySelector( '.waiting' );
      
      // Fade
      TweenMax.to( waiting, 1, {
        opacity: 0,
        delay: 1
      } );
    } else if( video.playing ) {
      // Loop back to video start
      // Not necessarily 0:00
      if( video.first == data.time ) 
      {
        video.popcorn.play( video.start );                
      }
    }
  }
    
  // Build polyline
  map.route.getPath().push( new google.maps.LatLng( data.latitude, data.longitude ) );
  map.google.panTo( new google.maps.LatLng( data.latitude, data.longitude ) );
  
  // Update marker
  map.marker.setPosition( new google.maps.LatLng( data.latitude, data.longitude ) );
  
  // Update dashboard
  TweenMax.to( ecu, 1, {
    rpm: data.rpm / MAX_RPM,
    vss: data.speed / MAX_SPEED,
    temp: data.coolant / MAX_COOLANT,
    onUpdate: update
  } )
}  
 
// Called when playback log is loaded
// Makes array of data
// Calculates playback rate
function doPlaybackLoad()
{
  var data = null;
  var difference = null;
  var entries = null;
  var previous = null;
  var sum = null;
  
  // Split off data lines
  entries = offline.xhr.response.trim().split( '\n' );
  
  // Playback data
  offline.playback = [];
  
  // Parse off data lines
  for( var e = 0; e < entries.length; e++ ) 
  {
    data = JSON.parse( entries[e] );
    offline.playback.push( data );
    
    // Average out playback rate
    if( previous == null )
    {
      previous = data.time;
      sum = 0;
    } else {
      difference = data.time - previous;
      previous = data.time;
      sum = sum + difference;
    }
  }
  
  // Calculate playback rate
  // Start playback
  offline.rate = Math.round( sum / entries.length );
  offline.index = 0;
  offline.interval = setInterval( doGatewayMessage, offline.rate );
}

// Called when document is loaded
// Looks for query string behaviors
// Connects to Kaazing Gateway
// Initializes Google Maps
// Draws dashboard
function doWindowLoad()
{
  var options = null;
  var script = null;
  var source = null;

  // Video playback
  if( URLParser( window.location.href ).hasParam( 'playback' ) )
  {
    console.log( 'Video requested.' );
    
    // Dashboard indicator that video is loaded
    video.ready = document.querySelector( '.movie' );
    video.ready.style.display = 'inline';
    
    // Where to start the video
    video.playing = false;
    video.start = parseInt( URLParser( window.location.href ).getParam( 'playback' ) );
    
    // Popcorn wrapper for playback
    video.popcorn = Popcorn( 'video' );
    
    // Show video
    video.screen = document.querySelector( '.driver' );
    video.screen.style.visibility = 'visible';
    
    // Set source at runtime
    // Sems to impact preload
    video.element = document.querySelector( 'video' );    
    source = document.createElement( 'source' );    
    source.src = VIDEO_PATH;
    source.type = VIDEO_TYPE;
    video.element.appendChild( source );

    // Change indicator when fully loaded
    video.element.addEventListener( 'canplaythrough', evt => {
      console.log( 'Video loaded.' );
      video.ready.style.backgroundImage = 'url( \'img/video.svg\' )';
    } );
    video.element.load();
  }  
  
  // Mapping
  // Start at home
  options = {
    center: new google.maps.LatLng( 39.4975231, -104.7791048 ),
    zoom: 16        
  };  
  
  // Element
  // Google Map
  // Car marker
  map.root = document.querySelector( '.map' );
  map.google = new google.maps.Map( map.root, options );  
  map.marker = new google.maps.Marker( {
    position: new google.maps.LatLng( 39.4975231, -104.7791048 ),
    map: map.google,
    icon: {
      anchor: new google.maps.Point( 12, 9 ),
      url: 'img/car.svg'  
    }
  } );
  
  // Route polyline
  map.route = new google.maps.Polyline( {
    path: map.path,
    geodesic: true,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 5
  } );  
  map.route.setMap( map.google );
  
  // Dashboard reference
  svg.root = document.querySelector( 'svg' );
  svg.root.style.width = window.innerWidth + 'px';
  
  // Draw dashboard
  draw();
  
  // Use local data
  // Average out playback rate
  average();
}
  
// Listen for the document to load
window.addEventListener( 'load', doWindowLoad );  
