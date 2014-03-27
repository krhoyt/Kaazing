function Altimeter( selector )
{
    var FONT_FAMILY = "sans-serif";
    var FONT_SIZE = 18;
    var MAX_ALTITUDE = 6000;
    var SVG_NAMESPACE = "http://www.w3.org/2000/svg";

    var clipping = null;
    var defs = null;
    var element = null;
    var holder = null;
    var position = null;
    var result = null;

    result = {
        altitude: 0,
        container: document.querySelector( selector ),
        document: document.createElementNS( SVG_NAMESPACE, "svg" )
    };

    result.container.style.top = Math.round( ( window.innerHeight - result.container.clientHeight ) / 2 ) + "px";

    result.document.setAttribute( "width", result.container.clientWidth );
    result.document.setAttribute( "height", result.container.clientHeight );
    result.container.appendChild( result.document );

    // Definitions
    defs = document.createElementNS( SVG_NAMESPACE, "defs" );
    result.document.appendChild( defs );

    // Clipping
    clipping = document.createElementNS( SVG_NAMESPACE, "clipPath" );
    clipping.setAttribute( "id", "gauge" );
    defs.appendChild( clipping );

    element = document.createElementNS( SVG_NAMESPACE, "rect" );
    element.setAttribute( "x", 0 );
    element.setAttribute( "y", 0 );
    element.setAttribute( "width", result.container.clientWidth - 4 );
    element.setAttribute( "height", result.container.clientHeight - ( 28 * 2 ) );
    element.setAttribute( "fill", "red" );
    clipping.appendChild( element );

    // Outline
    element = document.createElementNS( SVG_NAMESPACE, "rect" );
    element.setAttribute( "x", 1 );
    element.setAttribute( "y", 1 );
    element.setAttribute( "width", result.container.clientWidth - 2 );
    element.setAttribute( "height", result.container.clientHeight - 2 );
    element.setAttribute( "fill", "rgba( 0, 0, 0, 0.40 )" );
    element.setAttribute( "stroke", "white" );
    result.document.appendChild( element );

    // Units
    element = document.createElementNS( SVG_NAMESPACE, "text" );
    element.textContent = "Feet";
    element.setAttribute( "x", ( result.container.clientWidth - 2 ) / 2 );
    element.setAttribute( "y", 20 );
    element.setAttribute( "fill", "white" );
    element.setAttribute( "text-anchor", "middle" );
    element.setAttribute( "font-size", FONT_SIZE );
    element.setAttribute( "font-family", FONT_FAMILY );
    result.document.appendChild( element );

    element = document.createElementNS( SVG_NAMESPACE, "polyline" );
    element.setAttribute( "points", "1, 26 " + ( result.container.clientWidth - 1 ) + ", 26" );
    element.setAttribute( "stroke", "white" );
    result.document.appendChild( element );

    // Source
    element = document.createElementNS( SVG_NAMESPACE, "text" );
    element.textContent = "ALT";
    element.setAttribute( "x", ( result.container.clientWidth - 2 ) / 2 );
    element.setAttribute( "y", result.container.clientHeight - 8 );
    element.setAttribute( "fill", "white" );
    element.setAttribute( "text-anchor", "middle" );
    element.setAttribute( "font-size", FONT_SIZE );
    element.setAttribute( "font-family", FONT_FAMILY );
    result.document.appendChild( element );

    element = document.createElementNS( SVG_NAMESPACE, "polyline" );
    element.setAttribute( "points", "1, " + ( result.container.clientHeight - 28 ) + " " + ( result.container.clientWidth - 1 ) + ", " + ( result.container.clientHeight - 28 ) );
    element.setAttribute( "stroke", "white" );
    result.document.appendChild( element );

    // Gauge holder
    holder = document.createElementNS( SVG_NAMESPACE, "g" );
    holder.setAttribute( "transform", "translate( 2, 27 )" );
    holder.setAttribute( "clip-path", "url( #gauge )" );
    result.document.appendChild( holder );

    // Gauge slider
    result.gauge = document.createElementNS( SVG_NAMESPACE, "g" );
    result.gauge.setAttribute( "transform", "translate( 0, 0 )" );
    holder.appendChild( result.gauge );

    // Digits
    position = ( result.container.clientHeight / 2 ) - 27;

    for( var digit = 0; digit < MAX_ALTITUDE; digit += 20 )
    {
        if( digit % 100 == 0)
        {
            element = document.createElementNS( SVG_NAMESPACE, "polyline" );
            element.setAttribute( "points", "0, " + position + " 10, " + position );
            element.setAttribute( "stroke", "white" );
            result.gauge.appendChild( element );

            element = document.createElementNS( SVG_NAMESPACE, "text" );
            element.textContent = digit;
            element.setAttribute( "x", 15 );
            element.setAttribute( "y", position + 6 );
            element.setAttribute( "fill", "white" );
            element.setAttribute( "font-size", FONT_SIZE );
            element.setAttribute( "font-family", FONT_FAMILY );
            result.gauge.appendChild( element );
        } else {
            element = document.createElementNS( SVG_NAMESPACE, "polyline" );
            element.setAttribute( "points", "0, " + position + " 5, " + position );
            element.setAttribute( "stroke", "white" );
            result.gauge.appendChild( element );
        }

        position = position - 8;
    }

    // Current holder
    holder = document.createElementNS( SVG_NAMESPACE, "g" );
    holder.setAttribute( "transform", "translate( 2, " + ( ( result.container.clientHeight / 2 ) - 13 ) + " )" );
    result.document.appendChild( holder );

    // Indicator
    element = document.createElementNS( SVG_NAMESPACE, "path" );
    element.setAttribute( "d",
        "M" + ( result.container.clientWidth - 4 ) + ", " + "0 " +
        "L6, 0 " +
        "L6, 8 " +
        "L1, 13 " +
        "L6, 18 " +
        "L6, 26 " +
        "L" + ( result.container.clientWidth - 4 ) + ", 26"
    );
    element.setAttribute( "stroke", "white" );
    element.setAttribute( "fill", "black" );
    holder.appendChild( element );

    // Current
    result.current = document.createElementNS( SVG_NAMESPACE, "text" );
    result.current.textContent = "0";
    result.current.setAttribute( "x", 15 );
    result.current.setAttribute( "y", 19 );
    result.current.setAttribute( "fill", "white" );
    result.current.setAttribute( "font-size", FONT_SIZE );
    result.current.setAttribute( "font-family", FONT_FAMILY );
    holder.appendChild( result.current );

    // Forty (40) pixels per one hundred (100) feet
    // Animation iterations
    result.updateAltitude = function() {
        result.current.textContent = Math.round( result.altitude );
        result.gauge.setAttribute( "transform", "translate( 0, " + ( result.altitude * ( 40 / 100 ) ) + " )" );
    }

    // Set altitude
    // Kick off animation
    result.setAltitude = function( altitude ) {
        TweenLite.to( this, 1, {
            altitude: altitude,
            onUpdate: this.updateAltitude
        } );
    }

    return result;
}