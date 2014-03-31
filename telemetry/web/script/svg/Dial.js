function Dial( selector, label, minimum, maximum, animate )
{
    var FONT_FAMILY = "sans-serif";
    var FONT_SIZE = 18;
    var LABEL_SIZE = 14;
    var SVG_NAMESPACE = "http://www.w3.org/2000/svg";

    var clipping = null;
    var defs = null;
    var element = null;
    var result = null;

    result = {
        animate: animate,
        maximum: maximum,
        minimum: minimum,
        value: minimum,
        container: document.querySelector( selector ),
        document: document.createElementNS( SVG_NAMESPACE, "svg" )
    };

    result.container.style.height = result.container.clientWidth + "px";

    result.document.setAttribute( "width", result.container.clientWidth );
    result.document.setAttribute( "height", result.container.clientHeight );
    result.container.appendChild( result.document );

    // Definitions
    defs = document.createElementNS( SVG_NAMESPACE, "defs" );
    result.document.appendChild( defs );

    // Low points
    hypotenuse = ( result.container.clientWidth / 2 ) - 1;
    startAdjacent = Math.sin( 60 * ( Math.PI / 180 ) ) * hypotenuse;
    startOpposite = Math.cos( 60 * ( Math.PI / 180 ) ) * hypotenuse;

    mediumAdjacent = Math.sin( 50 * ( Math.PI / 180 ) ) * hypotenuse;
    mediumOpposite = Math.cos( 50 * ( Math.PI / 180 ) ) * hypotenuse;

    // Clipping for low range
    clipping = document.createElementNS( SVG_NAMESPACE, "clipPath" );
    clipping.setAttribute( "id", "low" );
    defs.appendChild( clipping );

    element = document.createElementNS( SVG_NAMESPACE, "path" );
    element.setAttribute( "d",
        "M" + hypotenuse + ", " + hypotenuse + " " +
        "l" + ( 0 - startAdjacent ) + ", " + startOpposite + " " +
        "L0, " + ( hypotenuse + startOpposite ) + " " +
        "L0, 0 " +
        "L" + ( hypotenuse - mediumAdjacent ) + ", " + ( hypotenuse - mediumOpposite ) + " " +
        "L" + hypotenuse + ", " + hypotenuse
    );
    element.setAttribute( "fill", "red" );
    clipping.appendChild( element );

    // Clipping for medium range
    clipping = document.createElementNS( SVG_NAMESPACE, "clipPath" );
    clipping.setAttribute( "id", "medium" );
    defs.appendChild( clipping );

    element = document.createElementNS( SVG_NAMESPACE, "path" );
    element.setAttribute( "d",
        "M" + hypotenuse + ", " + hypotenuse + " " +
        "L" + ( hypotenuse - mediumAdjacent ) + ", " + ( hypotenuse - mediumOpposite ) + " " +
        "L" + ( hypotenuse - mediumAdjacent ) + ", 0 " +
        "L" + ( hypotenuse + mediumAdjacent ) + ", 0 " +
        "L" + ( hypotenuse + mediumAdjacent ) + ", " + ( hypotenuse - mediumOpposite ) + " " +
        "L" + hypotenuse + ", " + hypotenuse
    );
    element.setAttribute( "fill", "red" );
    clipping.appendChild( element );

    // Clipping for high range
    clipping = document.createElementNS( SVG_NAMESPACE, "clipPath" );
    clipping.setAttribute( "id", "high" );
    defs.appendChild( clipping );

    element = document.createElementNS( SVG_NAMESPACE, "path" );
    element.setAttribute( "d",
        "M" + hypotenuse + ", " + hypotenuse + " " +
        "L" + ( hypotenuse + mediumAdjacent ) + ", " + ( hypotenuse - mediumOpposite ) + " " +
        "L" + result.container.clientWidth + ", 0 " +
        "L" + result.container.clientWidth + ", " + ( hypotenuse + startOpposite ) + " " +
        "L" + ( hypotenuse + startAdjacent ) + ", " + ( hypotenuse + startOpposite ) + " " +
        "L" + hypotenuse + ", " + hypotenuse
    );
    element.setAttribute( "fill", "red" );
    clipping.appendChild( element );

    // Background
    element = document.createElementNS( SVG_NAMESPACE, "circle" );
    element.setAttribute( "cx", result.container.clientWidth / 2 );
    element.setAttribute( "cy", result.container.clientHeight / 2 );
    element.setAttribute( "r", ( result.container.clientWidth / 2 ) - 1 );
    element.setAttribute( "fill", "rgba( 0, 0, 0, 0.30 )" );
    element.setAttribute( "stroke", "white" );
    result.document.appendChild( element );

    // Minimum (0) position
    var holder = document.createElementNS( SVG_NAMESPACE, "g" );
    holder.setAttribute( "transform", "rotate( " +
        "-120 " +
        ( result.container.clientWidth / 2 ) + " " +
        ( result.container.clientHeight / 2 ) + " )"
    );
    result.document.appendChild( holder );

    element = document.createElementNS( SVG_NAMESPACE, "polyline" );
    element.setAttribute( "points",
        ( result.container.clientWidth / 2 ) + ", 1 " +
        ( result.container.clientWidth / 2 ) + ", " + 15
    );
    element.setAttribute( "stroke", "white" );
    element.setAttribute( "stroke-width", 1 );
    holder.appendChild( element );

    // Maximum (100) position
    var holder = document.createElementNS( SVG_NAMESPACE, "g" );
    holder.setAttribute( "transform", "rotate( " +
        "120 " +
        ( result.container.clientWidth / 2 ) + " " +
        ( result.container.clientHeight / 2 ) + " )"
    );
    result.document.appendChild( holder );

    element = document.createElementNS( SVG_NAMESPACE, "polyline" );
    element.setAttribute( "points",
        ( result.container.clientWidth / 2 ) + ", 1 " +
        ( result.container.clientWidth / 2 ) + ", " + 15
    );
    element.setAttribute( "stroke", "white" );
    element.setAttribute( "stroke-width", 1 );
    holder.appendChild( element );

    // Low dial
    element = document.createElementNS( SVG_NAMESPACE, "circle" );
    element.setAttribute( "clip-path", "url( #low )" );
    element.setAttribute( "cx", result.container.clientWidth / 2 );
    element.setAttribute( "cy", result.container.clientHeight / 2 );
    element.setAttribute( "r", ( result.container.clientWidth / 2 ) - 3 );
    element.setAttribute( "fill", "none" );
    element.setAttribute( "stroke", "green" );
    element.setAttribute( "stroke-width", 3 );
    result.document.appendChild( element );

    // Medium dial
    element = document.createElementNS( SVG_NAMESPACE, "circle" );
    element.setAttribute( "clip-path", "url( #medium )" );
    element.setAttribute( "cx", result.container.clientWidth / 2 );
    element.setAttribute( "cy", result.container.clientHeight / 2 );
    element.setAttribute( "r", ( result.container.clientWidth / 2 ) - 3 );
    element.setAttribute( "fill", "none" );
    element.setAttribute( "stroke", "yellow" );
    element.setAttribute( "stroke-width", 3 );
    result.document.appendChild( element );

    // High dial
    element = document.createElementNS( SVG_NAMESPACE, "circle" );
    element.setAttribute( "clip-path", "url( #high )" );
    element.setAttribute( "cx", result.container.clientWidth / 2 );
    element.setAttribute( "cy", result.container.clientHeight / 2 );
    element.setAttribute( "r", ( result.container.clientWidth / 2 ) - 3 );
    element.setAttribute( "fill", "none" );
    element.setAttribute( "stroke", "red" );
    element.setAttribute( "stroke-width", 3 );
    result.document.appendChild( element );

    // Label
    element = document.createElementNS( SVG_NAMESPACE, "text" );
    element.textContent = label;
    element.setAttribute( "x", result.container.clientWidth / 2 );
    element.setAttribute( "y", ( result.container.clientHeight / 2 ) + 35 );
    element.setAttribute( "fill", "white" );
    element.setAttribute( "text-anchor", "middle" );
    element.setAttribute( "font-size", LABEL_SIZE );
    element.setAttribute( "font-family", FONT_FAMILY );
    result.document.appendChild( element );

    // Numeric display
    result.current = document.createElementNS( SVG_NAMESPACE, "text" );
    result.current.textContent = minimum.toFixed( 2 );
    result.current.setAttribute( "x", result.container.clientWidth / 2 );
    result.current.setAttribute( "y", ( result.container.clientHeight / 2 ) + 55 );
    result.current.setAttribute( "fill", "white" );
    result.current.setAttribute( "text-anchor", "middle" );
    result.current.setAttribute( "font-size", FONT_SIZE );
    result.current.setAttribute( "font-family", FONT_FAMILY );
    result.document.appendChild( result.current );

    // Needle
    result.needle = document.createElementNS( SVG_NAMESPACE, "g" );
    result.needle.setAttribute( "transform", "rotate( " +
        -120 + " " +
        ( result.container.clientWidth / 2 ) + " " +
        ( result.container.clientHeight / 2 ) + " )"
    );
    result.document.appendChild( result.needle );

    element = document.createElementNS( SVG_NAMESPACE, "path" );
    element.setAttribute( "d",
        "M" + ( result.container.clientWidth / 2 ) + ", " + ( result.container.clientHeight / 2 ) + " " +
        "l0, " + ( 23 - ( result.container.clientHeight / 2 ) ) + " " +
        "l6, -8 " +
        "l-6, -8 " +
        "l-6, 8 " +
        "l6, 8"
    );
    element.setAttribute( "fill", "none" );
    element.setAttribute( "stroke", "white" );
    element.setAttribute( "stroke-width", 3 );
    result.needle.appendChild( element );

    // Forty (40) pixels per one hundred (100) feet
    // Animation iterations
    result.updateValue = function() {
        var adjusted = -120 + ( ( result.value - minimum ) * ( 240 / ( result.maximum - result.minimum ) ) )

        result.current.textContent = result.value.toFixed( 2 );
        result.needle.setAttribute( "transform", "rotate( " +
            adjusted + " " +
            ( result.container.clientWidth / 2 ) + " " +
            ( result.container.clientHeight / 2 ) + " )"
        );
    }

    // Set value
    // Kick off animation
    result.setValue = function( value ) {
        if( value < result.minimum )
        {
            value = result.minimum;
        }

        if( value > result.maximum )
        {
            value = result.maximum;
        }

        if( this.animate )
        {
            TweenLite.to( this, 1, {
                value: value,
                onUpdate: this.updateValue
            } );
        } else {
            this.value = value;
            this.updateValue();
        }
    }

    return result;
}