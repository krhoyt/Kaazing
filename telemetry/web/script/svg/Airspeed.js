function Airspeed( selector, animate )
{
    var FONT_FAMILY = "sans-serif";
    var FONT_SIZE = 18;
    var MAX_AIRSPEED = 40;
    var STEP_SIZE = 45;
    var SVG_NAMESPACE = "http://www.w3.org/2000/svg";
    var ZONE_GREEN = 13;
    var ZONE_YELLOW = 11;

    var clipping = null;
    var defs = null;
    var element = null;
    var holder = null;
    var position = null;
    var result = null;

    result = {
        airspeed: 0,
        animate,
        container: document.querySelector( selector ),
        document: document.createElementNS( SVG_NAMESPACE, "svg" )
    };

    result.container.style.height = result.container.clientHeight + "px";
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
    element.textContent = "MPH";
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
    holder = document.createElementNS( SVG_NAMESPACE, "text" );
    holder.textContent = "V";
    holder.setAttribute( "x", ( result.container.clientWidth - 2 ) / 2 );
    holder.setAttribute( "y", result.container.clientHeight - 8 );
    holder.setAttribute( "fill", "white" );
    holder.setAttribute( "text-anchor", "middle" );
    holder.setAttribute( "font-size", FONT_SIZE );
    holder.setAttribute( "font-family", FONT_FAMILY );
    result.document.appendChild( holder );

    element = document.createElementNS( SVG_NAMESPACE, "tspan" );
    element.textContent = "GPS";
    element.setAttribute( "fill", "white" );
    element.setAttribute( "font-size", FONT_SIZE * 0.60 );
    element.setAttribute( "font-family", FONT_FAMILY );
    holder.appendChild( element );

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

    for( var digit = 0; digit < MAX_AIRSPEED; digit++ )
    {
        element = document.createElementNS( SVG_NAMESPACE, "polyline" );
        element.setAttribute( "points",
            result.container.clientWidth - 27 + ", " +
            position + " " +
            result.container.clientWidth + ", " +
            position
        );
        element.setAttribute( "stroke", "white" );
        result.gauge.appendChild( element );

        element = document.createElementNS( SVG_NAMESPACE, "text" );
        element.textContent = digit;
        element.setAttribute( "x", result.container.clientWidth - 32 );
        element.setAttribute( "y", position + 6 );
        element.setAttribute( "fill", "white" );
        element.setAttribute( "text-anchor", "end" );
        element.setAttribute( "font-size", FONT_SIZE );
        element.setAttribute( "font-family", FONT_FAMILY );
        result.gauge.appendChild( element );

        position = position - STEP_SIZE;
    }

    // Zones
    // Green
    element = document.createElementNS( SVG_NAMESPACE, "rect" );
    element.setAttribute( "x", result.container.clientWidth - 17 );
    element.setAttribute( "y", ( ( result.container.clientHeight / 2 ) - 27 ) - ( STEP_SIZE * ZONE_GREEN ) );
    element.setAttribute( "width", 15 );
    element.setAttribute( "height", STEP_SIZE * ZONE_GREEN );
    element.setAttribute( "fill", "green" );
    result.gauge.appendChild( element );

    // Yellow
    element = document.createElementNS( SVG_NAMESPACE, "rect" );
    element.setAttribute( "x", result.container.clientWidth - 17 );
    element.setAttribute( "y", ( ( result.container.clientHeight / 2 ) - 27 ) - ( STEP_SIZE * ( ZONE_GREEN + ZONE_YELLOW ) ) );
    element.setAttribute( "width", 15 );
    element.setAttribute( "height", STEP_SIZE * ZONE_YELLOW );
    element.setAttribute( "fill", "yellow" );
    result.gauge.appendChild( element );

    // Red
    element = document.createElementNS( SVG_NAMESPACE, "rect" );
    element.setAttribute( "x", result.container.clientWidth - 17 );
    element.setAttribute( "y", ( ( result.container.clientHeight / 2 ) - 27 ) - ( STEP_SIZE * MAX_AIRSPEED ) );
    element.setAttribute( "width", 15 );
    element.setAttribute( "height", STEP_SIZE * ( MAX_AIRSPEED - ( ZONE_GREEN + ZONE_YELLOW ) ) );
    element.setAttribute( "fill", "red" );
    result.gauge.appendChild( element );

    // Current holder
    holder = document.createElementNS( SVG_NAMESPACE, "g" );
    holder.setAttribute( "transform", "translate( 2, " + ( ( result.container.clientHeight / 2 ) - 13 ) + " )" );
    result.document.appendChild( holder );

    // Indicator
    element = document.createElementNS( SVG_NAMESPACE, "path" );
    element.setAttribute( "d",
        "M0, 0 " +
        "L" + ( result.container.clientWidth - 23 ) + ", 0 " +
        "L" + ( result.container.clientWidth - 23 ) + ", 8 " +
        "L" + ( result.container.clientWidth - 18 ) + ", 13 " +
        "L" + ( result.container.clientWidth - 23 ) + ", 18 " +
        "L" + ( result.container.clientWidth - 23 ) + ", 26 " +
        "L0, 26"
    );
    element.setAttribute( "stroke", "white" );
    element.setAttribute( "fill", "black" );
    holder.appendChild( element );

    // Current
    result.current = document.createElementNS( SVG_NAMESPACE, "text" );
    result.current.textContent = "0.00";
    result.current.setAttribute( "x", result.container.clientWidth - 32 );
    result.current.setAttribute( "y", 19 );
    result.current.setAttribute( "fill", "white" );
    result.current.setAttribute( "font-size", FONT_SIZE );
    result.current.setAttribute( "font-family", FONT_FAMILY );
    result.current.setAttribute( "text-anchor", "end" );
    holder.appendChild( result.current );

    // Forty-five (45) pixels per single foot
    // Animation iterations
    result.updateAirspeed = () => {
        result.current.textContent = result.airspeed.toFixed( 2 );
        result.gauge.setAttribute( "transform", "translate( 0, " + ( result.airspeed * 45 ) + " )" );
    }

    // Set altitude
    // Kick off animation
    result.setAirspeed = function( airspeed ) {
        if( this.animate ) {
            TweenLite.to( this, 1, {
                airspeed,
                onUpdate: this.updateAirspeed
            } );
        } else {
            this.airspeed = airspeed;
            this.updateAirspeed();
        }

    }

    return result;
}
