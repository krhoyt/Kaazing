function Tilt( selector, animate )
{
    var FONT_FAMILY = "sans-serif";
    var SVG_NAMESPACE = "http://www.w3.org/2000/svg";

    var clipping = null;
    var defs = null;
    var element = null;
    var holder = null;
    var result = null;

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

    // Clipping tilt
    clipping = document.createElementNS( SVG_NAMESPACE, "clipPath" );
    clipping.setAttribute( "id", "tilt" );
    defs.appendChild( clipping );

    element = document.createElementNS( SVG_NAMESPACE, "rect" );
    element.setAttribute( "x", ( result.container.clientWidth / 2 ) - 125 );
    element.setAttribute( "y", ( result.container.clientWidth / 2 ) - 135 );
    element.setAttribute( "width", 250 );
    element.setAttribute( "height", 75 );
    element.setAttribute( "fill", "red" );
    clipping.appendChild( element );

    // Tilt gauge
    // Gets rotate (left and right)
    result.tiltGauge = document.createElementNS( SVG_NAMESPACE, "g" );
    result.tiltGauge.setAttribute( "clip-path", "url( #tilt )" );
    result.document.appendChild( result.tiltGauge );

    // Semi-circle
    element = document.createElementNS( SVG_NAMESPACE, "circle" );
    element.setAttribute( "cx", result.container.clientWidth / 2 );
    element.setAttribute( "cy", result.container.clientHeight / 2 );
    element.setAttribute( "r", 120 );
    element.setAttribute( "stroke", "white" );
    element.setAttribute( "fill", "none" );
    result.tiltGauge.appendChild( element );

    // Center triangle
    element = document.createElementNS( SVG_NAMESPACE, "polyline" );
    element.setAttribute( "points",
        ( result.container.clientWidth / 2 ) + ", " + ( ( result.container.clientHeight / 2 ) - 121 ) + " " +
        ( ( result.container.clientWidth / 2 ) - 6 ) + ", " + ( ( result.container.clientHeight / 2 ) - 131 ) + " " +
        ( ( result.container.clientWidth / 2 ) + 6 ) + ", " + ( ( result.container.clientHeight / 2 ) - 131 ) + " " +
        ( result.container.clientWidth / 2 ) + ", " + ( ( result.container.clientHeight / 2 ) - 121 )
    );
    element.setAttribute( "fill", "white" );
    element.setAttribute( "stroke", "white" );
    result.tiltGauge.appendChild( element );

    // Left ten (10)
    element = document.createElementNS( SVG_NAMESPACE, "polyline" );
    element.setAttribute( "transform", "rotate( -10 " +
        ( result.container.clientWidth / 2 ) + " " +
        ( result.container.clientHeight / 2 ) + " )"
    );
    element.setAttribute( "points",
        ( result.container.clientWidth / 2 ) + ", " + ( ( result.container.clientHeight / 2 ) - 120 ) + " " +
        ( result.container.clientWidth / 2 ) + ", " + ( ( result.container.clientHeight / 2 ) - 126 )
    );
    element.setAttribute( "stroke", "white" );
    result.tiltGauge.appendChild( element );

    // Left twenty (20)
    element = document.createElementNS( SVG_NAMESPACE, "polyline" );
    element.setAttribute( "transform", "rotate( -20 " +
        ( result.container.clientWidth / 2 ) + " " +
        ( result.container.clientHeight / 2 ) + " )"
    );
    element.setAttribute( "points",
        ( result.container.clientWidth / 2 ) + ", " + ( ( result.container.clientHeight / 2 ) - 120 ) + " " +
        ( result.container.clientWidth / 2 ) + ", " + ( ( result.container.clientHeight / 2 ) - 126 )
    );
    element.setAttribute( "stroke", "white" );
    result.tiltGauge.appendChild( element );

    // Left thirty (30)
    element = document.createElementNS( SVG_NAMESPACE, "polyline" );
    element.setAttribute( "transform", "rotate( -30 " +
        ( result.container.clientWidth / 2 ) + " " +
        ( result.container.clientHeight / 2 ) + " )"
    );
    element.setAttribute( "points",
        ( result.container.clientWidth / 2 ) + ", " + ( ( result.container.clientHeight / 2 ) - 120 ) + " " +
        ( result.container.clientWidth / 2 ) + ", " + ( ( result.container.clientHeight / 2 ) - 132 )
    );
    element.setAttribute( "stroke", "white" );
    result.tiltGauge.appendChild( element );

    // Left triangle (45)
    element = document.createElementNS( SVG_NAMESPACE, "polyline" );
    element.setAttribute( "transform", "rotate( -45 " +
        ( result.container.clientWidth / 2 ) + " " +
        ( result.container.clientHeight / 2 ) + " )"
    );
    element.setAttribute( "points",
        ( result.container.clientWidth / 2 ) + ", " + ( ( result.container.clientHeight / 2 ) - 121 ) + " " +
        ( ( result.container.clientWidth / 2 ) - 6 ) + ", " + ( ( result.container.clientHeight / 2 ) - 131 ) + " " +
        ( ( result.container.clientWidth / 2 ) + 6 ) + ", " + ( ( result.container.clientHeight / 2 ) - 131 ) + " " +
        ( result.container.clientWidth / 2 ) + ", " + ( ( result.container.clientHeight / 2 ) - 121 )
    );
    element.setAttribute( "stroke", "white" );
    element.setAttribute( "fill", "none" );
    result.tiltGauge.appendChild( element );

    // Left extreme (60) (45 - 90)
    element = document.createElementNS( SVG_NAMESPACE, "polyline" );
    element.setAttribute( "transform", "rotate( -60 " +
        ( result.container.clientWidth / 2 ) + " " +
        ( result.container.clientHeight / 2 ) + " )"
    );
    element.setAttribute( "points",
        ( result.container.clientWidth / 2 ) + ", " + ( ( result.container.clientHeight / 2 ) - 120 ) + " " +
        ( result.container.clientWidth / 2 ) + ", " + ( ( result.container.clientHeight / 2 ) - 132 )
    );
    element.setAttribute( "stroke", "white" );
    result.tiltGauge.appendChild( element );

    // Right ten (10)
    element = document.createElementNS( SVG_NAMESPACE, "polyline" );
    element.setAttribute( "transform", "rotate( 10 " +
        ( result.container.clientWidth / 2 ) + " " +
        ( result.container.clientHeight / 2 ) + " )"
    );
    element.setAttribute( "points",
        ( result.container.clientWidth / 2 ) + ", " + ( ( result.container.clientHeight / 2 ) - 120 ) + " " +
        ( result.container.clientWidth / 2 ) + ", " + ( ( result.container.clientHeight / 2 ) - 126 )
    );
    element.setAttribute( "stroke", "white" );
    result.tiltGauge.appendChild( element );

    // Right twenty (20)
    element = document.createElementNS( SVG_NAMESPACE, "polyline" );
    element.setAttribute( "transform", "rotate( 20 " +
        ( result.container.clientWidth / 2 ) + " " +
        ( result.container.clientHeight / 2 ) + " )"
    );
    element.setAttribute( "points",
        ( result.container.clientWidth / 2 ) + ", " + ( ( result.container.clientHeight / 2 ) - 120 ) + " " +
            ( result.container.clientWidth / 2 ) + ", " + ( ( result.container.clientHeight / 2 ) - 126 )
    );
    element.setAttribute( "stroke", "white" );
    result.tiltGauge.appendChild( element );

    // Right thirty (30)
    element = document.createElementNS( SVG_NAMESPACE, "polyline" );
    element.setAttribute( "transform", "rotate( 30 " +
        ( result.container.clientWidth / 2 ) + " " +
        ( result.container.clientHeight / 2 ) + " )"
    );
    element.setAttribute( "points",
        ( result.container.clientWidth / 2 ) + ", " + ( ( result.container.clientHeight / 2 ) - 120 ) + " " +
        ( result.container.clientWidth / 2 ) + ", " + ( ( result.container.clientHeight / 2 ) - 132 )
    );
    element.setAttribute( "stroke", "white" );
    result.tiltGauge.appendChild( element );

    // Right triangle (45)
    element = document.createElementNS( SVG_NAMESPACE, "polyline" );
    element.setAttribute( "transform", "rotate( 45 " +
        ( result.container.clientWidth / 2 ) + " " +
        ( result.container.clientHeight / 2 ) + " )"
    );
    element.setAttribute( "points",
        ( result.container.clientWidth / 2 ) + ", " + ( ( result.container.clientHeight / 2 ) - 121 ) + " " +
        ( ( result.container.clientWidth / 2 ) - 6 ) + ", " + ( ( result.container.clientHeight / 2 ) - 131 ) + " " +
        ( ( result.container.clientWidth / 2 ) + 6 ) + ", " + ( ( result.container.clientHeight / 2 ) - 131 ) + " " +
        ( result.container.clientWidth / 2 ) + ", " + ( ( result.container.clientHeight / 2 ) - 121 )
    );
    element.setAttribute( "stroke", "white" );
    element.setAttribute( "fill", "none" );
    result.tiltGauge.appendChild( element );

    // Right extreme
    element = document.createElementNS( SVG_NAMESPACE, "polyline" );
    element.setAttribute( "transform", "rotate( 60 " +
        ( result.container.clientWidth / 2 ) + " " +
        ( result.container.clientHeight / 2 ) + " )"
    );
    element.setAttribute( "points",
        ( result.container.clientWidth / 2 ) + ", " + ( ( result.container.clientHeight / 2 ) - 120 ) + " " +
        ( result.container.clientWidth / 2 ) + ", " + ( ( result.container.clientHeight / 2 ) - 130 )
    );
    element.setAttribute( "stroke", "white" );
    result.tiltGauge.appendChild( element );

    // Degree per degree up to 45
    // 15 virtual degrees for last 45 real degrees
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

    return result;
}
