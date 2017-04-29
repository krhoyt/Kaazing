// https://www.npmjs.org/package/stomp-client
var Stomp = require( "stomp-client" );

// http://www.mongodb.org/
// https://github.com/LearnBoost/monk
var mongo = require( "mongodb" );
var monk = require( "monk" );

// Constants
var BROKER_IP = "127.0.0.1";
var BROKER_PORT = 61613;
var MONGO_DB = "localhost:27017/telemetry";
var MONGO_COLLECTION = "sensorcollection";
var TOPIC = "/topic/telemetry/data";

// Connect to the database
var db = monk( MONGO_DB );
var collection = db.get( MONGO_COLLECTION );

// Connect to the broker
var client = new Stomp( BROKER_IP, BROKER_PORT, null, null );

// Connection to broker
client.connect( sessionId => {
    // Subscribe to a topic
    client.subscribe( TOPIC, (body, headers) => {
        // Parse message content
        var line = body.toString().substring( 0, body.toString().length - 1 );
        var parts = line.split( "," );
        var stamp = new Date(
            parseInt( parts[10] ),
            parseInt( parts[8] ),
            parseInt( parts[9] ),
            parseInt( parts[11] ),
            parseInt( parts[12] ),
            parseInt( parts[13] ),
            0
        );

        // Debug
        // console.log( "Message arrived:", line );

        // Add record to database
        collection.insert( {
            aircraft: parts[0],
            stamp,
            latitude: parseFloat( parts[1] ),
            longitude: parseFloat( parts[2] ),
            meters: parseFloat( parts[3] ),
            feet: parseFloat( parts[4] ),
            mps: parseFloat( parts[5] ),
            mph: parseFloat( parts[6] ),
            heading: parseFloat( parts[7] ),
            compass: parseFloat( parts[14] ),
            xaxis: parseFloat( parts[15] ),
            yaxis: parseFloat( parts[16] ),
            zaxis: parseFloat( parts[17] ),
            farenheit: parseFloat( parts[18] ),
            celcius: parseFloat( parts[19] ),
            humidity: parseFloat( parts[20] ),
            flight: parts[21]
        }, (err, doc) => {
            if( err )
            {
                console.log( "Error adding record." );
            } else {
                // Display resulting ID
                console.log( "Record added: " + doc._id );
            }
        } );
    } );
} );
