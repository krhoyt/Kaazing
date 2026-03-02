function Heading( selector, animate )
{
    var FONT_FAMILY = "sans-serif";
    var FONT_SIZE = 18;
    var INDICATOR_HEIGHT = 32.5;
    var INDICATOR_WIDTH = 49;
    var SEGMENT_LONG = 10;
    var SEGMENT_SHORT = 5;
    var SVG_NAMESPACE = "http://www.w3.org/2000/svg";

    var defs = null;
    var element = null;
    var masking = null;
    var result = null;
    var segment = null;
    var segmentLength = null;

    result = {
        SOURCE_COMPASS: "C",
        SOURCE_GPS: "G",
        animate,
        gaugeRadius: 0,
        heading: 0,
        container: document.querySelector( selector ),
        document: document.createElementNS( SVG_NAMESPACE, "svg" )
    }

    result.gaugeRadius = result.container.clientHeight / 2;

    result.container.style.height = ( result.container.clientHeight + INDICATOR_HEIGHT ) + "px";
    result.container.style.width = result.container.clientHeight + "px";

    result.document.setAttribute( "width", result.container.clientWidth );
    result.document.setAttribute( "height", result.container.clientHeight );
    result.container.appendChild( result.document );

    // Definitions
    defs = document.createElementNS( SVG_NAMESPACE, "defs" );
    result.document.appendChild( defs );

    // Masking
    // See through center hole
    masking = document.createElementNS( SVG_NAMESPACE, "mask" );
    masking.setAttribute( "id", "hole" );
    defs.appendChild( masking );

    segment = document.createElementNS( SVG_NAMESPACE, "circle" );
    segment.setAttribute( "cx", result.container.clientWidth / 2 );
    segment.setAttribute( "cy", result.container.clientHeight / 2 );
    segment.setAttribute( "r", result.gaugeRadius + 1 );
    segment.setAttribute( "fill", "white" );
    segment.setAttribute( "stroke", "none" );
    masking.appendChild( segment );

    segment = document.createElementNS( SVG_NAMESPACE, "circle" );
    segment.setAttribute( "cx", result.container.clientWidth / 2 );
    segment.setAttribute( "cy", result.container.clientHeight / 2 );
    segment.setAttribute( "r", 15 );
    segment.setAttribute( "fill", "green" );
    segment.setAttribute( "stroke", "none" );
    masking.appendChild( segment );

    // Gauge
    result.gauge = document.createElementNS( SVG_NAMESPACE, "g" );
    result.gauge.setAttribute( "transform", "translate( 0, " + ( INDICATOR_HEIGHT / 2 ) + " )" );
    result.document.appendChild( result.gauge );

    element = document.createElementNS( SVG_NAMESPACE, "circle" );
    element.setAttribute( "mask", "url( #hole )" );
    element.setAttribute( "cx", result.container.clientWidth / 2 );
    element.setAttribute( "cy", result.container.clientHeight / 2 );
    element.setAttribute( "r", result.gaugeRadius );
    element.setAttribute( "fill", "rgba( 0, 0, 0, 0.40 )" );
    element.setAttribute( "stroke", "none" );
    result.gauge.appendChild( element );

    // Segments
    for( var d = 0; d < 360; d += 5 )
    {
        // Holder
        // Build vertically
        // Rotate to desired position
        segment = document.createElementNS( SVG_NAMESPACE, "g" );
        segment.setAttribute( "transform", "translate( " + ( result.container.clientWidth / 2 ) + ", 0  )" );
        segment.setAttribute( "transform",
            "rotate( " +
                d + " " +
                ( result.container.clientWidth / 2 ) + " " +
                ( result.container.clientHeight / 2 ) + " " +
            ")"
        );
        result.gauge.appendChild( segment );

        // Labeled stops
        if( d % 30 == 0 )
        {
            segmentLength = SEGMENT_LONG;

            element = document.createElementNS( SVG_NAMESPACE, "text" );
            element.setAttribute( "x", result.container.clientWidth / 2 );
            element.setAttribute( "y", 28.5 + ( INDICATOR_HEIGHT / 2 ) );
            element.setAttribute( "text-anchor", "middle" );
            element.setAttribute( "fill", "white" );
            element.setAttribute( "font-family", FONT_FAMILY );
            element.setAttribute( "font-size", FONT_SIZE );
            segment.appendChild( element );

            // Cardinal directions
            if( d / 90 == 0 )
            {
                element.textContent = "N";
            } else if( d / 90 == 1 ) {
                element.textContent = "E";
            } else if( d / 90 == 2 ) {
                element.textContent = "S";
            } else if( d / 90 == 3 ) {
                element.textContent = "W";
            } else {
                element.textContent = d / 10;
            }
        } else {
            segmentLength = SEGMENT_SHORT;
        }

        // Line
        element = document.createElementNS( SVG_NAMESPACE, "polyline" );
        element.setAttribute( "points",
            ( result.container.clientWidth / 2 ) + ", " + ( 0 + ( INDICATOR_HEIGHT / 2 ) ) + " " +
            ( result.container.clientHeight / 2 ) + ", " + ( segmentLength + ( INDICATOR_HEIGHT / 2 ) )
        );
        element.setAttribute( "stroke", "white" );
        segment.appendChild( element );
    }

    // Current
    segment = document.createElementNS( SVG_NAMESPACE, "g" );
    segment.setAttribute( "transform", "translate( " + ( ( result.container.clientWidth - INDICATOR_WIDTH ) / 2 ) + ", 1 )" );
    result.document.appendChild( segment );

    element = document.createElementNS( SVG_NAMESPACE, "polyline" );
    element.setAttribute( "points",
        "0, 0 " +
        INDICATOR_WIDTH + ", 0 " +
        INDICATOR_WIDTH + ", 26 " +
        ( ( INDICATOR_WIDTH / 2 ) + 5 ) + ", 26 " +
        ( INDICATOR_WIDTH / 2 ) + ", 31 " +
        ( ( INDICATOR_WIDTH / 2 ) - 5 ) + ", 26 " +
        "0, 26 " +
        "0, 0"
    );
    element.setAttribute( "stroke", "white" );
    element.setAttribute( "fill", "black" );
    segment.appendChild( element );

    result.current = document.createElementNS( SVG_NAMESPACE, "text" );
    result.current.textContent = "0";
    result.current.setAttribute( "x", INDICATOR_WIDTH / 2 );
    result.current.setAttribute( "y", 19 );
    result.current.setAttribute( "text-anchor", "middle" );
    result.current.setAttribute( "fill", "white" );
    result.current.setAttribute( "font-family", FONT_FAMILY );
    result.current.setAttribute( "font-size", FONT_SIZE );
    segment.appendChild( result.current );

    segment = document.createElementNS( SVG_NAMESPACE, "g" );
    segment.setAttribute( "transform", "translate( " + ( ( ( result.container.clientWidth + INDICATOR_WIDTH ) / 2 ) + 10 ) + ", 7.5 )" );
    result.document.appendChild( segment );

    element = document.createElementNS( SVG_NAMESPACE, "rect" );
    element.setAttribute( "width", 13 );
    element.setAttribute( "height", 13 );
    element.setAttribute( "fill", "white" );
    element.setAttribute( "stroke", "black" );
    segment.appendChild( element );

    result.source = document.createElementNS( SVG_NAMESPACE, "text" );
    result.source.textContent = result.SOURCE_COMPASS;
    result.source.setAttribute( "x", 6.5 );
    result.source.setAttribute( "y", 11 );
    result.source.setAttribute( "text-anchor", "middle" );
    result.source.setAttribute( "fill", "black" );
    result.source.setAttribute( "font-family", FONT_FAMILY );
    result.source.setAttribute( "font-size", 12 );
    result.source.setAttribute( "font-weight", "bold" );
    result.source.setAttribute( "style", "cursor: default;" );
    segment.appendChild( result.source );

    // Manage source display
    result.getSource = function() {
        var source = this.SOURCE_COMPASS;

        if( this.source.textContent != this.SOURCE_COMPASS )
        {
            source = result.SOURCE_GPS;
        }

        return source;
    }

    result.setSource = function( source ) {
        this.source.textContent = source;
    }

    // Degrees
    // Animation iterations
    result.updateHeading = () => {
        result.current.textContent = Math.round( result.heading );
        result.gauge.setAttribute( "transform",
            "translate( 0, " + ( INDICATOR_HEIGHT / 2 ) + " ) " +
            "rotate( " +
                ( 0 - result.heading ) + " " +
                ( result.container.clientWidth / 2 ) + " " +
                ( result.container.clientHeight / 2 ) + " " +
            ")"
        );
    }

    // Set heading
    // Kick off animation
    result.setHeading = function( heading ) {
        if( this.animate )
        {
            TweenLite.to( this, 1, {
                heading,
                onUpdate: this.updateHeading
            } );
        } else {
            this.heading = heading;
            this.updateHeading();
        }
    }

    return result;
}
