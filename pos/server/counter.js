// Modules
// https://github.com/easternbloc/node-stomp-client
// NOTE: The content-length header must be commented out
//       ActiveMQ uses the header as a JMS flag
//       Header can be found in frame.js
var Stomp = require( "stomp-client" );

// Constants
var BROKER_ADDRESS = "127.0.0.1";
var BROKER_PORT = 61613;
var TOPIC_COUNTER = "/topic/counter";

// Global
var count = null;
var interval = null;

// Connect to broker
var messaging = new Stomp( BROKER_ADDRESS, BROKER_PORT, null, null );

// Connected to broker
messaging.connect( function( sessionId ) {

    // Debug
    console.log( "Connected." );

    // Setup interval
    interval = setInterval( function() {

        // Create or increment counter
        if( count == null )
        {
            count = 1;
        } else {
            count = count + 1;
        }

        // Debug
        console.log( count );

        // Send current value
        // Content must be a string
        messaging.publish( TOPIC_COUNTER, count.toString() );

    // Every one second
    }, 1000 );
} );
