function Airspeed( selector, maximum, animate )
{
    var FONT_FAMILY = "source-sans-pro";
    var FONT_SIZE = 18;
    var STEP_SIZE = 90;

    var container = document.querySelector( selector );
    var canvas = document.createElement( "canvas" )
    var context = canvas.getContext( "2d" );
    var scale = 1 / window.devicePixelRatio;
    var gauge = document.querySelector( selector + " .gauge" );

    canvas.width = gauge.clientWidth * window.devicePixelRatio;
    canvas.height = gauge.clientHeight * window.devicePixelRatio;

    context.strokeStyle = "white";
    context.moveTo( canvas.width / 2, canvas.height / 2 );
    context.lineTo( canvas.width, canvas.height / 2 );
    context.stroke();

    gauge.style.backgroundImage = "url( " + canvas.toDataURL( "image/png" ) + " )";
    gauge.style.backgroundSize = gauge.clientWidth + "px auto";

    /*
    var position = null;

    result.container.style.height = result.container.clientHeight + "px";
    result.container.style.top = Math.round( ( window.innerHeight - result.container.clientHeight ) / 2 ) + "px";

    // High DPI support
    // Size font accordingly
    result.factor = 1 / window.devicePixelRatio;
    FONT_SIZE = FONT_SIZE * window.devicePixelRatio;

    // Canvas dimensions * pixel ratio
    // Otherwise known as "really big"
    // CSS to scale back down to fit screen
    result.canvas.setAttribute( "width", result.container.clientWidth * window.devicePixelRatio );
    result.canvas.setAttribute( "height", result.container.clientHeight * window.devicePixelRatio );
    result.canvas.style.width = ( result.canvas.width * result.factor ) + "px";
    result.canvas.style.height = ( result.canvas.height * result.factor ) + "px";
    result.container.appendChild( result.canvas );

    result.stage = new createjs.Stage( result.canvas );

    // Outline
    shape = new createjs.Shape();
    shape.graphics.beginFill( "rgba( 0, 0, 0, 0.30 )" );
    shape.graphics.setStrokeStyle( 2 );
    shape.graphics.beginStroke( "white" );
    shape.graphics.drawRect( 2, 2, result.canvas.width - 3, result.canvas.height - 3 );
    shape.graphics.moveTo( 2, 54 );
    shape.graphics.lineTo( result.canvas.width, 54 );
    shape.graphics.moveTo( 2, result.canvas.height - 54 );
    shape.graphics.lineTo( result.canvas.width, result.canvas.height - 54 );
    shape.graphics.endFill();
    shape.graphics.endStroke();
    shape.cache( 2, 2, result.canvas.width - 3, result.canvas.height - 3 );
    result.stage.addChild( shape );

    // Units
    shape = new createjs.Text( "MPH", FONT_SIZE + "px " + FONT_FAMILY, "white" );
    shape.x = 47;
    shape.y = 9;
    result.stage.addChild( shape );

    // TODO: V-GPS

    shape = new createjs.Shape();
    shape.graphics.beginFill( "rgba( 255, 0, 0, 0 )" );
    shape.graphics.drawRect( 2, 54, result.canvas.width - 4, result.canvas.height - 108 );
    shape.graphics.endFill();
    result.stage.addChild( shape );

    result.gauge = new createjs.Container();
    result.gauge.mask = shape;
    result.stage.addChild( result.gauge );

    position = 0;

    for( var digit = 0; digit < result.maximum; digit++ )
    {
        shape = new createjs.Shape();
        shape.graphics.setStrokeStyle( 2 );
        shape.graphics.beginStroke( "white" );
        shape.graphics.moveTo( result.canvas.width / 2, ( result.canvas.height / 2 ) + position );
        shape.graphics.lineTo( result.canvas.width, ( result.canvas.height / 2 ) + position );
        shape.graphics.endStroke();
        result.gauge.addChild( shape );

        shape = new createjs.Text( digit, FONT_SIZE + "px " + FONT_FAMILY, "white" );
        shape.y = ( result.canvas.height / 2 ) + position - 20;
        shape.x = result.canvas.width - 90;
        result.gauge.addChild( shape );

        position = position - STEP_SIZE;
    }

    createjs.Ticker.addEventListener("tick", result.stage);

    result.setAirspeed = function( airspeed )
    {
        createjs.Tween.get( result.gauge ).to( {y: 270}, 1000 );
    }

    // result.gauge.cache( 0, 0, result.gauge.getBounds().width, result.gauge.getBounds().height );

    /*
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
    result.updateAirspeed = function() {
        result.current.textContent = result.airspeed.toFixed( 2 );
        result.gauge.setAttribute( "transform", "translate( 0, " + ( result.airspeed * 45 ) + " )" );
    }

    // Set altitude
    // Kick off animation
    result.setAirspeed = function( airspeed ) {
        if( this.animate ) {
            TweenLite.to( this, 1, {
                airspeed: airspeed,
                onUpdate: this.updateAirspeed
            } );
        } else {
            this.airspeed = airspeed;
            this.updateAirspeed();
        }

    }
    */

    // return result;
}
