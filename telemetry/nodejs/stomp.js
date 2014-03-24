// https://www.npmjs.org/package/stomp-client
var Stomp = require( "stomp-client" );

var BROKER_IP = "127.0.0.1";
var BROKER_PORT = 61613;
var TOPIC = "/topic/telemetry";

var client = new Stomp( BROKER_IP, BROKER_PORT, null, null );

client.connect( function( sessionId ) {
	client.subscribe( TOPIC, function( body, headers ) {
      console.log( "Message arrived: ", body );
    } );
} );
