function Pitch( selector, animate )
{
    var FONT_FAMILY = "sans-serif";
    var FONT_SIZE = 14;
    var PITCH_GAP = 25;
    var SEGMENT_SHORT = 25;
    var SEGMENT_LONG = 45;
    var DIRECTION_LINE = 10;
    var SVG_NAMESPACE = "http://www.w3.org/2000/svg";

    var clipping = null;
    var defs = null;
    var element = null;
    var holder = null;
    var offset = null;
    var position = null;
    var result = null;
    var segment = null;

    result = {
        animate: animate,
        pitch: 0,
        tilt: 0,
        container: document.querySelector( selector ),
        document: document.createElementNS( SVG_NAMESPACE, "svg" )
    };

    result.container.style.width = result.container.clientHeight + "px";
    result.container.style.height = result.container.clientHeight + "px";

    result.document.setAttribute( "width", result.container.clientWidth );
    result.document.setAttribute( "height", result.container.clientHeight );
    result.container.appendChild( result.document );

    // Definitions
    defs = document.createElementNS( SVG_NAMESPACE, "defs" );
    result.document.appendChild( defs );

    // Clipping
    clipping = document.createElementNS( SVG_NAMESPACE, "clipPath" );
    clipping.setAttribute( "id", "pitch" );
    defs.appendChild( clipping );

    element = document.createElementNS( SVG_NAMESPACE, "rect" );
    element.setAttribute( "width", 140 );
    element.setAttribute( "height", 120 );
    element.setAttribute( "fill", "red" );
    element.setAttribute( "x", ( result.container.clientWidth - 140 ) / 2 );
    element.setAttribute( "y", ( result.container.clientHeight - 120 ) / 2 );
    clipping.appendChild( element );

    // Pitch holder
    // Gets clipping
    result.tiltGauge = document.createElementNS( SVG_NAMESPACE, "g" );
    result.tiltGauge.setAttribute( "clip-path", "url( #pitch )" );
    result.document.appendChild( result.tiltGauge );

    // Pitch gauge
    // Gets translate (up and down)
    result.pitchGauge = document.createElementNS( SVG_NAMESPACE, "g" );
    result.pitchGauge.setAttribute( "transform", "translate( 0, 0 )" );
    result.tiltGauge.appendChild( result.pitchGauge );

    // Pitch indicator
    position = -18 * PITCH_GAP;

    for( var d = -90; d < 90; d += 5 )
    {
        if( d % 10 == 0 )
        {
            // Line
            element = document.createElementNS( SVG_NAMESPACE, "polyline" );
            element.setAttribute( "points",
                ( ( result.container.clientWidth / 2 ) - SEGMENT_LONG ) + ", " + ( ( result.container.clientHeight / 2 ) - position ) + " " +
                    ( ( result.container.clientWidth / 2 ) + SEGMENT_LONG ) + ", " + ( ( result.container.clientHeight / 2 ) - position )
            );
            element.setAttribute( "stroke", "white" );
            result.pitchGauge.appendChild( element );

            // Direction indicator lines
            if( d != 0 )
            {
                if( d < 0 )
                {
                    offset = 0 - DIRECTION_LINE;
                } else {
                    offset = DIRECTION_LINE;
                }

                element = document.createElementNS( SVG_NAMESPACE, "polyline" );
                element.setAttribute( "points",
                    ( ( result.container.clientWidth / 2 ) - SEGMENT_LONG ) + ", " + ( ( result.container.clientHeight / 2 ) - position ) + " " +
                    ( ( result.container.clientWidth / 2 ) - SEGMENT_LONG ) + ", " + ( ( result.container.clientHeight / 2 ) - position + offset )
                );
                element.setAttribute( "stroke", "white" );
                result.pitchGauge.appendChild( element );

                element = document.createElementNS( SVG_NAMESPACE, "polyline" );
                element.setAttribute( "points",
                    ( ( result.container.clientWidth / 2 ) + SEGMENT_LONG ) + ", " + ( ( result.container.clientHeight / 2 ) - position ) + " " +
                    ( ( result.container.clientWidth / 2 ) + SEGMENT_LONG ) + ", " + ( ( result.container.clientHeight / 2 ) - position + offset )
                );
                element.setAttribute( "stroke", "white" );
                result.pitchGauge.appendChild( element );
            }

            // Left
            element = document.createElementNS( SVG_NAMESPACE, "text" );
            element.textContent = Math.abs( d );
            element.setAttribute( "x", ( result.container.clientWidth / 2 ) - SEGMENT_LONG - 3 );
            element.setAttribute( "y", ( ( result.container.clientHeight / 2 ) + 5 ) - position );
            element.setAttribute( "font-size", FONT_SIZE );
            element.setAttribute( "font-family", FONT_FAMILY );
            element.setAttribute( "fill", "white" );
            element.setAttribute( "text-anchor", "end" );
            result.pitchGauge.appendChild( element );

            // Right
            element = document.createElementNS( SVG_NAMESPACE, "text" );
            element.textContent = Math.abs( d );
            element.setAttribute( "x", ( result.container.clientWidth / 2 ) + SEGMENT_LONG + 3 );
            element.setAttribute( "y", ( ( result.container.clientHeight / 2 ) + 5 ) - position );
            element.setAttribute( "font-size", FONT_SIZE );
            element.setAttribute( "font-family", FONT_FAMILY );
            element.setAttribute( "fill", "white" );
            element.setAttribute( "text-anchor", "start" );
            result.pitchGauge.appendChild( element );
        } else {
            // Line
            element = document.createElementNS( SVG_NAMESPACE, "polyline" );
            element.setAttribute( "points",
                ( ( result.container.clientWidth / 2 ) - SEGMENT_SHORT ) + ", " + ( ( result.container.clientHeight / 2 ) - position ) + " " +
                ( ( result.container.clientWidth / 2 ) + SEGMENT_SHORT ) + ", " + ( ( result.container.clientHeight / 2 ) - position )
            );
            element.setAttribute( "stroke", "white" );
            result.pitchGauge.appendChild( element );
        }

        position = position + PITCH_GAP;
    }

    // Animation iterations
    result.updateTilt = function() {
        var adjusted = Math.abs( result.tilt );

        if( adjusted > 45 && adjusted <= 90 )
        {
            adjusted = 45 + ( ( adjusted - 45 ) * ( 15 / 45 ) );
        }

        if( result.tilt < 0 )
        {
            adjusted = 0 - adjusted;
        }

        result.tiltGauge.setAttribute( "transform", "rotate( " +
            adjusted + " " +
            ( result.container.clientWidth / 2 ) + " " +
            ( result.container.clientHeight / 2 ) + " )"
        );
    }

    // Set tilt
    // Kick off animation
    result.setTilt = function( tilt ) {
        if( this.animate )
        {
            TweenLite.to( this, 1, {
                tilt: tilt,
                onUpdate: this.updateTilt
            } );
        } else {
            this.tilt = tilt;
            this.updateTilt();
        }
    }

    // Twenty-five (25) pixels per five (5) degrees
    // Animation iterations
    result.updatePitch = function() {
        result.pitchGauge.setAttribute( "transform", "translate( 0, " + ( result.pitch * ( 25 / 5 ) ) + " )" );
    }

    // Set pitch
    // Kick off animation
    result.setPitch = function( pitch ) {
        if( this.animate )
        {
            TweenLite.to( this, 1, {
                pitch: pitch,
                onUpdate: this.updatePitch
            } );
        } else {
            this.pitch = pitch;
            this.updatePitch();
        }
    }

    return result;
}
