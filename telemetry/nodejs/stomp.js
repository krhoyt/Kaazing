// https://www.npmjs.org/package/stomp-client
var Stomp = require( "stomp-client" );

// Constants
var BROKER_IP = "127.0.0.1";
var BROKER_PORT = 61613;
var TOPIC = "/topic/telemetry";

// Connect to broker
var client = new Stomp( BROKER_IP, BROKER_PORT, null, null );

// Connection to broker
client.connect( function( sessionId )
{
    // Subscribe to topic
	client.subscribe( TOPIC, function( body, headers )
    {
        // Display incoming messages
        console.log( "Message arrived:", body );
    } );
} );
