// https://www.npmjs.org/package/stomp-client
var Stomp = require( "stomp-client" );

// http://www.mongodb.org/
// https://github.com/LearnBoost/monk
var mongo = require( "mongodb" );
var monk = require( "monk" );


// Constants
var BROKER_IP = "127.0.0.1";
var BROKER_PORT = 61613;
var LIGHT_ON = "on";
var LIGHT_OFF = "off";
var MONGO_DB = "localhost:27017/telemetry";
var MONGO_COMMAND = "command";
var MONGO_DATA = "sensor";
var TOPIC_COMMAND = "/topic/telemetry/command";
var TOPIC_DATA = "/topic/telemetry/data";

// Connect to the database
var db = monk( MONGO_DB );
var command = db.get( MONGO_COMMAND );
var sensor = db.get( MONGO_DATA );

// Connect to the broker
var client = new Stomp( BROKER_IP, BROKER_PORT, null, null );

// Connection to broker
client.connect( sessionId => {
    // Subscribe to sensor telemetry data
    client.subscribe( TOPIC_DATA, (body, headers) => {
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
            parseInt( parts[14] ) * 100  // Arrives in centiseconds from GPS
        );

        // Debug
        // console.log( "Data arrived:", line );

        // Add record to database
        sensor.insert( {
            aircraft: parts[0],
            stamp,
            latitude: parseFloat( parts[1] ),
            longitude: parseFloat( parts[2] ),
            meters: parseFloat( parts[3] ),
            feet: parseFloat( parts[4] ),
            mps: parseFloat( parts[5] ),
            mph: parseFloat( parts[6] ),
            heading: parseFloat( parts[7] ),
            compass: parseFloat( parts[15] ),
            xaxis: parseFloat( parts[16] ),
            yaxis: parseFloat( parts[17] ),
            zaxis: parseFloat( parts[18] ),
            farenheit: parseFloat( parts[19] ),
            celcius: parseFloat( parts[20] ),
            humidity: parseFloat( parts[21] ),
            flight: parts[22]
        }, (err, doc) => {
            if( err )
            {
                console.log( "Error adding record." );
            } else {
                // Display resulting ID
                // console.log( "Data added: " + doc._id );
            }
        } );
    } );

    // Subscribe to commands going to sensor array
    // Lighting control
    client.subscribe( TOPIC_COMMAND, (body, headers) => {
        // Get message content
        var line = body.toString();
        var parts = line.split( "," );
        var lights = false;

        if( parts[1] == LIGHT_ON )
        {
            lights = true;
        }

        // Debug
        // console.log( "Command arrived:", line );

        // Add record to database
        command.insert( {
            stamp: new Date(),
            flight: parts[0],
            lights
        }, (err, doc) => {
            if( err )
            {
                console.log( "Error adding record." );
            } else {
                // Display resulting ID
                // console.log( "Command added: " + doc._id );
            }
        } );
    } );
} );
