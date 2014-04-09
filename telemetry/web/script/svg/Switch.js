function Switch( selector, label, enabled )
{
    var FONT_FAMILY = "sans-serif";
    var FONT_SIZE = 18;
    var LABEL_SIZE = 14;
    var SVG_NAMESPACE = "http://www.w3.org/2000/svg";

    var clipping = null;
    var defs = null;
    var element = null;
    var holder = null;
    var result = null;

    result = {
        on: 30,
        off: 0,
        current: 0,
        enabled: enabled,
        label: label,
        container: document.querySelector( selector ),
        document: document.createElementNS( SVG_NAMESPACE, "svg" )
    };

    result.container.style.height = "40px";

    result.document.setAttribute( "width", result.container.clientWidth );
    result.document.setAttribute( "height", result.container.clientHeight );
    result.container.appendChild( result.document );

    result.off = result.container.clientWidth - 79;

    // Definitions
    defs = document.createElementNS( SVG_NAMESPACE, "defs" );
    result.document.appendChild( defs );

    // Clipping
    clipping = document.createElementNS( SVG_NAMESPACE, "clipPath" );
    clipping.setAttribute( "id", "slider" );
    defs.appendChild( clipping );

    element = document.createElementNS( SVG_NAMESPACE, "path" );
    element.setAttribute( "d",
        "M 90 2 " +
        "A " + ( ( result.container.clientHeight - 2 ) / 2 ) + " " + ( ( result.container.clientHeight - 4 ) / 2 ) + " 0 0 0 " +
               "90 " + ( result.container.clientHeight - 2 ) + " " +
        "L " + ( result.container.clientWidth - ( ( result.container.clientHeight - 2 ) / 2 ) ) + " " + ( result.container.clientHeight - 2 ) + " " +
        "A " + ( ( result.container.clientHeight - 2 ) / 2 ) + " " + ( ( result.container.clientHeight - 4 ) / 2 ) + " 0 0 0 " +
               ( result.container.clientWidth - ( ( result.container.clientHeight - 2 ) / 2 ) ) + " 2 Z"
    );
    element.setAttribute( "fill", "black" );
    element.setAttribute( "stroke", "none" );
    clipping.appendChild( element );

    // Background
    element = document.createElementNS( SVG_NAMESPACE, "path" );
    element.setAttribute( "d",
        "M " + ( ( result.container.clientHeight - 2 ) / 2 ) + " 1 " +
        "A " + ( ( result.container.clientHeight - 2 ) / 2 ) + " " + ( ( result.container.clientHeight - 2 ) / 2 ) + " 0 0 0 " +
               ( ( result.container.clientHeight - 2 ) / 2 ) + " " + ( result.container.clientHeight - 1 ) + " " +
        "L " + ( result.container.clientWidth - ( ( result.container.clientHeight - 2 ) / 2 ) ) + " " + ( result.container.clientHeight - 1 ) + " " +
        "A " + ( ( result.container.clientHeight - 2 ) / 2 ) + " " + ( ( result.container.clientHeight - 2 ) / 2 ) + " 0 0 0 " +
               ( result.container.clientWidth - ( ( result.container.clientHeight - 2 ) / 2 ) ) + " 1 Z"
    );
    element.setAttribute( "fill", "rgba( 0, 0, 0, 0.30 )" );
    element.setAttribute( "stroke", "white" );
    result.document.appendChild( element );

    // Label
    element = document.createElementNS( SVG_NAMESPACE, "text" );
    element.textContent = label;
    element.setAttribute( "x", 13 );
    element.setAttribute( "y", ( result.container.clientHeight / 2 ) + 6 );
    element.setAttribute( "fill", "white" );
    element.setAttribute( "text-anchor", "start" );
    element.setAttribute( "font-size", FONT_SIZE );
    element.setAttribute( "font-family", FONT_FAMILY );
    result.document.appendChild( element );

    // Holder
    element = document.createElementNS( SVG_NAMESPACE, "path" );
    element.setAttribute( "d",
        "M 90 2 " +
        "A " + ( ( result.container.clientHeight - 4 ) / 2 ) + " " + ( ( result.container.clientHeight - 4 ) / 2 ) + " 0 0 0 " +
               "90 " + ( result.container.clientHeight - 2 ) + " " +
        "L " + ( result.container.clientWidth - ( ( result.container.clientHeight ) / 2 ) ) + " " + ( result.container.clientHeight - 2 ) + " " +
        "A " + ( ( result.container.clientHeight - 4 ) / 2 ) + " " + ( ( result.container.clientHeight - 4 ) / 2 ) + " 0 0 0 " +
               ( result.container.clientWidth - ( ( result.container.clientHeight ) / 2 ) ) + " 2 Z"
    );
    element.setAttribute( "fill", "black" );
    element.setAttribute( "stroke", "none" );
    result.document.appendChild( element );

    // Slider holder
    holder = document.createElementNS( SVG_NAMESPACE, "g" );
    holder.setAttribute( "clip-path", "url( #slider )" );
    result.document.appendChild( holder );

    // Slider background
    result.slider = document.createElementNS( SVG_NAMESPACE, "g" );

    // Set initial state
    if( result.enabled == true )
    {
        // On state
        result.slider.setAttribute( "transform", "translate( " + result.on + ", 0 )" );
        current = result.on;
    } else {
        // Off state
        result.slider.setAttribute( "transform", "translate( " + result.off + ", 0 )" );
        current = result.off;
    }

    holder.appendChild( result.slider );

    // Slider bar
    element = document.createElementNS( SVG_NAMESPACE, "rect" );
    element.setAttribute( "x", 0 );
    element.setAttribute( "y", 1 );
    element.setAttribute( "width", result.container.clientWidth );
    element.setAttribute( "height", result.container.clientHeight - 2 );
    result.slider.appendChild( element );

    // Red
    element = document.createElementNS( SVG_NAMESPACE, "rect" );
    element.setAttribute( "x", -10 );
    element.setAttribute( "y", 0 );
    element.setAttribute( "width", 70 );
    element.setAttribute( "height", result.container.clientHeight );
    element.setAttribute( "fill", "red" );
    result.slider.appendChild( element );

    // Green
    element = document.createElementNS( SVG_NAMESPACE, "rect" );
    element.setAttribute( "x", 60 );
    element.setAttribute( "y", 0 );
    element.setAttribute( "width", 70 );
    element.setAttribute( "height", result.container.clientHeight );
    element.setAttribute( "fill", "green" );
    result.slider.appendChild( element );

    // Off
    element = document.createElementNS( SVG_NAMESPACE, "text" );
    element.textContent = "OFF";
    element.setAttribute( "x", 5 );
    element.setAttribute( "y", ( result.container.clientHeight / 2 ) + 6 );
    element.setAttribute( "fill", "white" );
    element.setAttribute( "text-anchor", "start" );
    element.setAttribute( "font-size", LABEL_SIZE );
    element.setAttribute( "font-family", FONT_FAMILY );
    result.slider.appendChild( element );

    // Knob
    element = document.createElementNS( SVG_NAMESPACE, "circle" );
    element.setAttribute( "cx", 60 );
    element.setAttribute( "cy", result.container.clientHeight / 2 );
    element.setAttribute( "r", ( result.container.clientHeight - 4 ) / 2 );
    element.setAttribute( "fill", "black" );
    element.setAttribute( "stroke", "white" );
    result.slider.appendChild( element );

    // On
    element = document.createElementNS( SVG_NAMESPACE, "text" );
    element.textContent = "ON";
    element.setAttribute( "x", 88 );
    element.setAttribute( "y", ( result.container.clientHeight / 2 ) + 6 );
    element.setAttribute( "fill", "white" );
    element.setAttribute( "text-anchor", "start" );
    element.setAttribute( "font-size", LABEL_SIZE );
    element.setAttribute( "font-family", FONT_FAMILY );
    result.slider.appendChild( element );

    // Animation iterations
    result.updateAltitude = function() {
        result.slider.setAttribute( "transform", "translate( " + result.current + ", 0 )" );
    }

    // Set enabled
    // Kick off animation
    result.setEnabled = function( enabled ) {
        this.enabled = enabled;

        if( this.enabled )
        {
            this.current = result.off;

            TweenLite.to( this, 0.25, {
                current: result.on,
                startAt: result.off,
                onUpdate: this.updateAltitude
            } );
        } else {
            this.current = result.on;

            TweenLite.to( this, 0.25, {
                current: result.off,
                startAt: result.on,
                onUpdate: this.updateAltitude
            } );
        }
    }

    return result;
}