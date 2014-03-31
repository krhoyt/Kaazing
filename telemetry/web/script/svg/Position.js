function Position( selector )
{
    var HUD_COLOR = "yellow";
    var SVG_NAMESPACE = "http://www.w3.org/2000/svg";

    var element = null

    result = {
        container: document.querySelector( selector ),
        document: document.createElementNS( SVG_NAMESPACE, "svg" )
    }

    result.container.style.width = ( result.container.clientHeight + 68 ) + "px";
    result.container.style.height = result.container.clientWidth + "px";

    result.document.setAttribute( "width", result.container.clientWidth );
    result.document.setAttribute( "height", result.container.clientHeight );
    result.container.appendChild( result.document );

    // Center
    element = document.createElementNS( SVG_NAMESPACE, "circle" );
    element.setAttribute( "cx", result.container.clientWidth / 2 );
    element.setAttribute( "cy", result.container.clientHeight / 2 );
    element.setAttribute( "r", 15 );
    element.setAttribute( "stroke", HUD_COLOR );
    element.setAttribute( "stroke-width", 3 );
    element.setAttribute( "fill", "none" );
    result.document.appendChild( element );

    // Vertical
    element = document.createElementNS( SVG_NAMESPACE, "polyline" );
    element.setAttribute( "points",
        ( result.container.clientWidth / 2 ) + ", " + ( ( result.container.clientHeight / 2 ) - 15 ) + " " +
        ( result.container.clientWidth / 2 ) + ", " + ( ( result.container.clientHeight / 2 ) - 39.5 )
    );
    element.setAttribute( "stroke", HUD_COLOR );
    element.setAttribute( "stroke-width", 3 );
    result.document.appendChild( element );

    // To the right
    element = document.createElementNS( SVG_NAMESPACE, "polyline" );
    element.setAttribute( "points",
        ( ( result.container.clientWidth / 2 ) + 15 ) + ", " + ( result.container.clientHeight / 2 ) + " " +
        ( ( result.container.clientWidth / 2 ) + 40 ) + ", " + ( result.container.clientHeight / 2 )
    );
    element.setAttribute( "stroke", HUD_COLOR );
    element.setAttribute( "stroke-width", 3 );
    result.document.appendChild( element );

    // Far right
    element = document.createElementNS( SVG_NAMESPACE, "polyline" );
    element.setAttribute( "points",
        result.container.clientWidth + ", " + ( result.container.clientHeight / 2 ) + " " +
        ( result.container.clientWidth - 30 ) + ", " + ( result.container.clientHeight / 2 )
    );
    element.setAttribute( "stroke", HUD_COLOR );
    element.setAttribute( "stroke-width", 3 );
    result.document.appendChild( element );

    // To the left
    element = document.createElementNS( SVG_NAMESPACE, "polyline" );
    element.setAttribute( "points",
        ( ( result.container.clientWidth / 2 ) - 15 ) + ", " + ( result.container.clientHeight / 2 ) + " " +
        ( ( result.container.clientWidth / 2 ) - 40 ) + ", " + ( result.container.clientHeight / 2 )
    );
    element.setAttribute( "stroke", HUD_COLOR );
    element.setAttribute( "stroke-width", 3 );
    result.document.appendChild( element );

    // Far left
    element = document.createElementNS( SVG_NAMESPACE, "polyline" );
    element.setAttribute( "points",
        "0, " + ( result.container.clientHeight / 2 ) + " " +
        "30, " + ( result.container.clientHeight / 2 )
    );
    element.setAttribute( "stroke", HUD_COLOR );
    element.setAttribute( "stroke-width", 3 );
    result.document.appendChild( element );

    // Tilt indicator
    element = document.createElementNS( SVG_NAMESPACE, "polyline" );
    element.setAttribute( "points",
        ( result.container.clientWidth / 2 ) + ", " + ( ( result.container.clientHeight / 2 ) - 119 ) + " " +
        ( ( result.container.clientWidth / 2 ) - 6 ) + ", " + ( ( result.container.clientHeight / 2 ) - 108 ) + " " +
        ( ( result.container.clientWidth / 2 ) + 6 ) + ", " + ( ( result.container.clientHeight / 2 ) - 108 ) + " " +
        ( result.container.clientWidth / 2 ) + ", " + ( ( result.container.clientHeight / 2 ) - 119 )
    );
    element.setAttribute( "fill", "yellow" );
    element.setAttribute( "stroke", "yellow" );
    result.document.appendChild( element );

    return result;
}
